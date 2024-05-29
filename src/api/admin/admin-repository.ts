// api/users/user-repository.ts
import bcrypt from 'bcrypt';
const { Op } = require('sequelize');
import { User } from '../../model/users';
import { UserProfile } from '../../model/users_profile';
import { NFT } from '../../model/nfts';
import { Auction } from '../../model/auctions';
import { NFTAuction } from '../../model/nft_auctions';
import axios from 'axios';
import { Sequelize } from 'sequelize';

class AdminRepository {

    async login(payload: any) {
        try {            
            const { username, password } = payload;

            // Find user by email or phone number
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: username },
                        { mobileNumber: username }
                    ]
                }
            });

            if (!user) {
                // User not found
                return null;
            }

            // Compare passwords
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                // Passwords do not match
                return null;
            }

            const user_profile = user.userProfile;

            const response = {
                message : 'success',
                userId: user.user_id,
                user_profile: user_profile
            }
            return response;

        } catch (error) {
            console.error('Error logging in:', error);
            throw new Error('Failed to login');
        }
    }

    async register(payload: any) {
        try {
            const email = payload.email;
            const mobileNumber = payload.mobileNumber;
            const password  = payload.password;   
            const user_type = payload.user_type;         
            
            const existingUserByEmail = await User.findOne({
                where: { email },
            });
            
            const existingUserByMobileNumber = await User.findOne({
                where: { mobileNumber },
            });
            
            if (existingUserByEmail && existingUserByMobileNumber) {
                return 'Email and Mobile';
            } else if (existingUserByEmail) {
                return 'Email';
            } else if (existingUserByMobileNumber) {
                return 'Mobile';
            }            
    
            // Hash the password
            const hashedPassword: string = await bcrypt.hash(password, 10);
    
            // Create user record in the database
            const user = await User.create({
                email,
                mobileNumber,
                password: hashedPassword,
                user_type,
            });

            return 'Success';

        } catch (error) {
            console.error('Error registering user:', error);
            throw new Error('Failed to register user');
        }
    }

    async checkUserName(payload: any) {
        try {
            const username = payload.username;
            // Find a user profile with the given username
            const existingProfile = await UserProfile.findOne({
                where: { username }
            });
    
            return !!existingProfile;
        } catch (error) {
            // Handle errors
            console.error("Error checking username:", error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    async createProfile(payload: any) {
        try {
            const { fullName, country, username, day, month, year, gender, profilePhoto, acceptTerms, user_id } = payload;
    
            // Check if a user profile with the given userId exists
            const existingProfile = await UserProfile.findOne({ where: { user_id } });
    
            if (existingProfile) {
                // Update the existing user profile
                await UserProfile.update({
                    fullName,
                    country,
                    username,
                    day,
                    month,
                    year,
                    gender,
                    profilePhoto,
                    acceptTerms
                }, { where: { user_id } });

                await User.update({ userProfile: true }, { where: { user_id } });
    
                // Return success message for profile update
                return 'success';
            } else {
                // Create a new user profile entry
                await UserProfile.create({
                    fullName,
                    country,
                    username,
                    day,
                    month,
                    year,
                    gender,
                    profilePhoto,
                    acceptTerms,
                    user_id
                });

                await User.update({ userProfile: true }, { where: { user_id } });
    
                // Return success message for profile creation
                return 'success';
            }
        } catch (error) {
            // Handle errors
            console.error("Error creating/updating user profile:", error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }
    
    async getNFTS() {
        try {
            const nfts = await NFT.findAll({ where: { sold_price: null } });
            const modifiedNFTs = await Promise.all(nfts.map(async nft => {
                // Modify the nft_item property as needed
                nft.dataValues.nft_item = await this.modifyNFTItem(nft.dataValues.nft_item);
                return nft;
            }));    
            return modifiedNFTs;
        } catch (error) {
            console.error('Error fetching NFTs:', error);
            throw error; // Throw the error for handling in the caller function
        }
    }
    
    // Function to modify the nft_item property
    async modifyNFTItem(nftItem: string) {
        try {
            // Add a prefix to the nft_item
            console.log("NFT Item: ", nftItem);
            const downloadUrl = `https://drive.google.com/uc?id=${nftItem}`;
            const response = await axios.get(downloadUrl, {
                responseType: "arraybuffer", // Set response type to array buffer to receive binary data
            });
    
            if (response.status === 200) {
                let contentType = response.headers['content-type'];
                let base64Content = '';
                
                if (contentType.startsWith('image')) {
                    // If content type is image, no need to process, return directly
                    base64Content = Buffer.from(response.data, "binary").toString("base64");
                } else {
                    // Extract file extension from the content-disposition header
                    base64Content = Buffer.from(response.data, "binary").toString("base64");
                    const contentDisposition = response.headers['content-disposition'];
                    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
                    let fileExtension = '';
                    if (filenameMatch) {
                        const filename = filenameMatch[1];
                        fileExtension = filename.split('.').pop().toLowerCase();
                    }
                    console.log("file extension: ", fileExtension);
    
                    // Check file extension to determine the file type
                    if (fileExtension === 'pdf') {
                        contentType = 'application/pdf';
                    } else if (fileExtension === 'doc' || fileExtension === 'docx') {
                        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
                        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    } else if (fileExtension === 'csv') {
                        contentType = 'text/csv';
                    } else if (fileExtension === 'ppt' || fileExtension === 'pptx') {
                        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    } else if (fileExtension === 'mp3' ||
                    fileExtension === 'wav' ||
                    fileExtension === 'aac') {
                        contentType = `audio/${fileExtension}`;
                    } else if (fileExtension === 'mp4' ||
                    fileExtension === 'mov' ||
                    fileExtension === 'avi') {
                        contentType = `video/${fileExtension}`;
                    } else {
                        contentType = 'application/octet-stream'
                    }
                }
    
                return  `data:${contentType};base64,${base64Content}`;
            } else {
                return nftItem;
            }
        } catch (error) {
            console.error("Error modifying NFT item:", error);
            return nftItem;
        }
    }
    
    
    async getAuctions(): Promise<any[]> {
        try {
            const auctions = await Auction.findAll({
                include: [
                    {
                        model: NFTAuction,
                        attributes: ['nft_id']
                    }
                ],
                attributes: [
                    [Sequelize.literal('(SELECT COUNT(*) FROM NFTAuctions WHERE NFTAuctions.auction_id = Auction.auction_id)'), 'nft_items_count'],
                    'auction_id',
                    'auction_name',
                    'start_time',
                    'end_time'
                ],
                raw: true
            });
    
            // Group auctions by auction_id and store nft_items as objects with nft_id
            const groupedAuctions = auctions.reduce((acc, curr: any) => {
                const existingAuction = acc.find(a => a.auction_id === curr.auction_id);
                if (existingAuction) {
                    // If auction already exists, add nft_id to its auction_items array
                    existingAuction.auction_items.push({ nft_id: curr['auction_items.nft_id'] });
                } else {
                    // If auction doesn't exist, create a new auction object
                    const newAuction: any = { ...curr, auction_items: [{ nft_id: curr['auction_items.nft_id'] }] };
                    delete newAuction['auction_items.nft_id']; // Remove the redundant property
                    acc.push(newAuction);
                }
                return acc;
            }, []);
    
            // Fetch starting_price from nfts table and map it to auction_items
            await Promise.all(groupedAuctions.map(async (auction: any) => {
                if (auction.auction_items) {
                    await Promise.all(auction.auction_items.map(async (item: any) => {
                        const nft = await NFT.findByPk(item.nft_id, { attributes: ['starting_price'] });
                        if (nft) {
                            item.starting_price = nft.starting_price;
                        }
                    }));
                }
            }));
    
            return groupedAuctions;
        } catch (error) {
            console.log(error);
            throw new Error('Failed to fetch auctions');
        }
    }
       
      
    async createAuctions(payload: any) {
        try {
          const newAuction = await Auction.create(payload);
          return newAuction;
        } catch (error) {
          throw new Error('Failed to create auction');
        }
    }

    async addToAuction(payload: any) {
        const { nft_id, auction_id } = payload;
    
        try {
            // Check if the provided nft_id and auction_id exist
            const nft = await NFT.findByPk(nft_id);
            const auction = await Auction.findByPk(auction_id);
    
            if (!nft || !auction) {
                throw new Error('NFT or auction not found');
            }
    
            // Check if the NFT is already added to the same auction
            const existingNFTAuction = await NFTAuction.findOne({
                where: {
                    nft_id,
                    auction_id
                }
            });
    
            if (existingNFTAuction) {
                throw new Error('NFT is already added to this auction');
            }
    
            // Create a new NFTAuction record
            const nftAuction = await NFTAuction.create({
                nft_id,
                auction_id
            });
    
            return nftAuction;
        } catch (error) {
            throw new Error('Failed to add NFT to auction');
        }
    }
    
}

export const adminRepository = new AdminRepository();
