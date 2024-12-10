const cloudinary = require('cloudinary').v2;
const uuid = require('uuid').v7;

cloudinary.config({
    cloud_name: 'dr4dgbmun',
    api_key: '941885742989727',
    api_secret: 'CrdXDrDE7CyVKmAvVsSlb97yJhM'
});

const uploadBase64Image = async (base64Image) => {
    try {
        const uniqueFilename = `${uuid()}`;
        const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
            public_id: uniqueFilename,
            overwrite: true,
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        console.log('Image uploaded successfully:', result.url);
        return result.url;
    } catch (error) {
        console.error('Error uploading base64 image to Cloudinary:', error);
        throw error;
    }
};

const uploadImage = async (uri) => {
    try {
        if (!uri.startsWith('data:image/')) {
            throw new Error('Invalid image URI. Must be an accessible URI.');
        }
        const uniqueFilename = `${uuid()}`;
        const result = await cloudinary.uploader.upload(uri, {
            public_id: uniqueFilename,
            overwrite: true,
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });

        console.log('Image uploaded successfully:', result.url);
        return result.url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};

module.exports = { uploadBase64Image, uploadImage }