// api/users/user-repository.ts
import bcrypt from 'bcrypt';
const { Op } = require('sequelize');
import { User } from '../../model/users';
import { UserProfile } from '../../model/users_profile';


class UserRepository {

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
}

export const userRepository = new UserRepository();
