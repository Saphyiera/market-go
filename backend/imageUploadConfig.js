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

module.exports = { uploadBase64Image }