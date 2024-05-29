import base64
from flask import Flask, request, jsonify
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from PIL import Image
import torchvision.transforms as transforms
import torchvision.models as models
import copy
from io import BytesIO

app = Flask(__name__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Define normalization mean and std
cnn_normalization_mean = torch.tensor([0.485, 0.456, 0.406]).to(device)
cnn_normalization_std = torch.tensor([0.229, 0.224, 0.225]).to(device)

# Define default content and style layers
content_layers_default = ['conv_4']
style_layers_default = ['conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5']

# Define the VGG19 model
class VGG19(nn.Module):
    def __init__(self):
        super(VGG19, self).__init__()
        self.features = models.vgg19(pretrained=True).features.to(device).eval()

    def forward(self, x):
        return self.features(x)

def getPreTrainedNN():
    return VGG19().features.to(device).eval()

# Define the ContentLoss and StyleLoss classes
class ContentLoss(nn.Module):
    def __init__(self, target):
        super(ContentLoss, self).__init__()
        self.target = target.detach()

    def forward(self, input):
        self.loss = F.mse_loss(input, self.target)
        return input

class StyleLoss(nn.Module):
    def __init__(self, target_feature):
        super(StyleLoss, self).__init__()
        self.target = gram_matrix(target_feature).detach()

    def forward(self, input):
        G = gram_matrix(input)
        self.loss = F.mse_loss(G, self.target)
        return input

# Define helper functions
def gram_matrix(input):
    a, b, c, d = input.size()
    features = input.view(a * b, c * d)
    G = torch.mm(features, features.t())
    return G.div(a * b * c * d)

class Normalization(nn.Module):
    def __init__(self, mean, std):
        super(Normalization, self).__init__()
        self.mean = torch.tensor(mean).view(-1, 1, 1)
        self.std = torch.tensor(std).view(-1, 1, 1)

    def forward(self, img):
        return (img - self.mean) / self.std

def get_style_model_and_losses(cnn, normalization_mean, normalization_std,
                               style_img, content_img,
                               content_layers=None,
                               style_layers=None):
    cnn = copy.deepcopy(cnn)
    normalization = Normalization(normalization_mean, normalization_std).to(device)
    content_losses = []
    style_losses = []
    model = nn.Sequential(normalization)
    i = 0
    for layer in cnn.children():
        if isinstance(layer, nn.Conv2d):
            i += 1
            name = 'conv_{}'.format(i)
        elif isinstance(layer, nn.ReLU):
            name = 'relu_{}'.format(i)
            layer = nn.ReLU(inplace=False)
        elif isinstance(layer, nn.MaxPool2d):
            name = 'pool_{}'.format(i)
        elif isinstance(layer, nn.BatchNorm2d):
            name = 'bn_{}'.format(i)
        else:
            raise RuntimeError('Unrecognized layer: {}'.format(layer.__class__.__name__))
        model.add_module(name, layer)
        if name in content_layers:
            target = model(content_img).detach()
            content_loss = ContentLoss(target)
            model.add_module("content_loss_{}".format(i), content_loss)
            content_losses.append(content_loss)
        if name in style_layers:
            target_feature = model(style_img).detach()
            style_loss = StyleLoss(target_feature)
            model.add_module("style_loss_{}".format(i), style_loss)
            style_losses.append(style_loss)
    for i in range(len(model) - 1, -1, -1):
        if isinstance(model[i], ContentLoss) or isinstance(model[i], StyleLoss):
            break
    model = model[:(i + 1)]
    return model, style_losses, content_losses

def get_input_optimizer(input_img):
    optimizer = optim.LBFGS([input_img.requires_grad_()])
    return optimizer

def run_style_transfer(cnn, normalization_mean, normalization_std,
                       content_img, style_img, input_img,
                       style_weight=10000000, content_weight=1, content_layers=None,
                       style_layers=None, optimizer=None, max_iterations=500, style_loss_threshold=25):
    """Run the style transfer with early stopping or a maximum iteration limit."""
    model, style_losses, content_losses = get_style_model_and_losses(
        cnn, normalization_mean, normalization_std, style_img, content_img,
        content_layers, style_layers)
    
    early_stopping_triggered = False  # To track if early stopping condition is met
    run = [0]  # Counter for the number of iterations

    def closure():
        nonlocal early_stopping_triggered
        input_img.data.clamp_(0, 1)  # Clamp the image data to ensure it's in the correct range
        optimizer.zero_grad()
        model(input_img)
        style_score = 0
        content_score = 0

        for sl in style_losses:
            style_score += sl.loss
        for cl in content_losses:
            content_score += cl.loss

        style_score *= style_weight
        content_score *= content_weight
        loss = style_score + content_score
        loss.backward()

        if run[0] % 50 == 0 or run[0] == max_iterations:  # Print info every 50 steps or on the last step
            print(f"Run {run[0]}:")
            print(f'Style Loss : {style_score.item():4f} Content Loss: {content_score.item():4f}')
        
        # Early stopping check
        if style_score.item() < style_loss_threshold:
            early_stopping_triggered = True
            print(f"Early stopping at iteration {run[0]} with style loss {style_score.item()}.")

        run[0] += 1
        return loss

    while run[0] <= max_iterations and not early_stopping_triggered:
        optimizer.step(closure)
    
    input_img.data.clamp_(0, 1)  # Ensure the final image data is clamped
    return input_img


def image_transformer(image):
    imsize = 512 if torch.cuda.is_available() else 128
    loader = transforms.Compose([
        transforms.Resize(imsize),
        transforms.ToTensor()])
    return loader(image)

def image_loader(image):
    if isinstance(image, str):
        image = Image.open(image)
    image = image_transformer(image).unsqueeze(0)
    return image.to(device, torch.float) 

def unload_tensor_to_image(image):
    # Squeeze the tensor to remove the batch dimension
    image = image.squeeze(0)
    unloader = transforms.ToPILImage()
    return unloader(image)


def decode_base64_image(base64_string):
    # Check if the base64 string contains the header and split it
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    # Decode the base64 string into bytes
    image_bytes = base64.b64decode(base64_string)
    # Convert bytes to a PIL Image
    try:
        image = Image.open(BytesIO(image_bytes))
        return image
    except IOError:
        # This exception handles cases where the image cannot be opened
        raise ValueError("Cannot decode image, may be corrupted or format not supported.")

@app.route('/rsupload', methods=['POST'])
def upload_images():
    if 'content' not in request.form or 'style' not in request.form:
        return jsonify({'error': 'Content and style images are required.'}), 400

    try:
        content_image = decode_base64_image(request.form['content'])
        style_image = decode_base64_image(request.form['style'])
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    # Convert PIL Images to tensors
    content_img = image_loader(content_image)
    style_img = image_loader(style_image)

    # Assuming get_input_optimizer and other functions like run_style_transfer are defined elsewhere and correct
    input_img = content_img.clone()
    optimizer = get_input_optimizer(input_img)
    cnn = getPreTrainedNN()
    output = run_style_transfer(cnn, cnn_normalization_mean, cnn_normalization_std,
                                content_img, style_img, input_img, content_layers=content_layers_default,
                                style_layers=style_layers_default, optimizer=optimizer)

    # Convert output tensor to PIL image and then to base64 string
    output_image = unload_tensor_to_image(output)
    buffered = BytesIO()
    output_image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    return jsonify({'image': img_str})

if __name__ == '__main__':
    app.run(debug=True)
