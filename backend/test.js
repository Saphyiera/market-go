const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function uploadImage() {
    const imageUrl = 'https://scontent.fhph2-1.fna.fbcdn.net/v/t1.6435-9/80013976_986310728417765_541154763920637952_n.jpg?stp=dst-jpg_s600x600&_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEd29QpvpixBx2u3By0LtekFw_TlOKmHHEXD9OU4qYccaibTSaCsFHbULvZ_FxNQOIjbmj_hTACeb9M47B3HTdU&_nc_ohc=lkPwW1GyHooQ7kNvgGpkK47&_nc_zt=23&_nc_ht=scontent.fhph2-1.fna&_nc_gid=AUJPmqt8GSLGNZqA_Fa2oXa&oh=00_AYCWe1Nx30VlJfRfTbn3oJzIxdljFHAkUrT0xu4GjP69Iw&oe=675425C6';
    const groupId = '2'; // Replace with the actual Group ID

    try {
        // Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        // Convert the image response to a buffer
        const buffer = await response.buffer();

        // Create form data
        const form = new FormData();
        form.append('groupimg', buffer, { filename: 'groupimg.jpg' });
        form.append('groupId', groupId);

        // Upload the image to your server
        const uploadResponse = await fetch('http://localhost:2811/group/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
        });

        const result = await uploadResponse.json();
        console.log('Upload response:', result);

    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

uploadImage();
