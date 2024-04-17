
let uploadedImageUrl = null; // เพิ่มตัวแปรเก็บ URL ของรูปภาพที่อัพโหลดไปก่อนหน้า
let lastUploadTime = null;
const minUploadInterval = 30000; // ระยะเวลาขั้นต่ำระหว่างการอัปโหลด (ในมิลลิวินาที)
const ipAddress = 'localhost'; // 


function uploadImage() {
    const input = document.getElementById('uploadInput');
    const file = input.files[0];
    if (file) {
        const now = Date.now();
        if (lastUploadTime && now - lastUploadTime < minUploadInterval) {
            showNotification('กรุณารอสักครู่ก่อนที่จะอัปโหลดรูปภาพอีกครั้ง', 'error');
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'png' && fileExtension !== 'jpg') {
            showNotification('กรุณาอัปโหลดไฟล์ .png หรือ .jpg เท่านั้น', 'error');
            return;
        }

        const maxSizeMB = 3;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file && file.size > maxSizeBytes) {
            showNotification(`ขนาดไฟล์เกิน ${maxSizeMB} MB กรุณาอัปโหลดรูปภาพที่มีขนาดน้อยกว่า ${maxSizeMB} MB`, 'error');
            return;
        }

        const uploadButton = document.getElementById('uploadButton');
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.classList.remove('hidden');
        uploadButton.disabled = true;

        const shouldRemoveBackground = false;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('removeBackground', shouldRemoveBackground);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const imageUrl = data.imageUrl;
            uploadedImageUrl = imageUrl;
            const imageUrlInput = document.getElementById('imageUrl');
         
            imageUrlInput.value = `http://${ipAddress}:3000${imageUrl}`;
            document.getElementById('imageUrlContainer').style.display = 'block';
            showNotification('อัพโหลดรูปภาพสำเร็จ.');
            lastUploadTime = now; // บันทึกเวลาปัจจุบันเป็นเวลาล่าสุดที่มีการอัปโหลด
            loadingSpinner.classList.add('hidden');
            uploadButton.disabled = false;
            displayUploadedImage();
        })
        
        .catch(error => console.error('Error:', error));
    }
}




function showNotification(message, type = 'success') {
    const notification = document.getElementById('successAlert');
    const notificationMessage = document.getElementById('notificationMessage');
    notificationMessage.innerText = message;

    if (type === 'error') {
        notification.classList.remove('bg-green-100', 'border-green-400', 'text-green-700');
        notification.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
    } else {
        notification.classList.remove('bg-red-100', 'border-red-400', 'text-red-700');
        notification.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
    }

    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}


// ฟังก์ชันสำหรับแสดงรูปภาพที่อัพโหลด
function displayUploadedImage() {
    const uploadedImageContainer = document.getElementById('uploadedImageContainer');
    // ตรวจสอบว่ามีรูปภาพที่อัพโหลดไปก่อนหน้าหรือไม่
    if (uploadedImageUrl) {
        // ลบรูปภาพที่แสดงอยู่ออกเพื่อรีค่ารูปภาพที่เคยอัพโหลดไปก่อนหน้า
        while (uploadedImageContainer.firstChild) {
            uploadedImageContainer.removeChild(uploadedImageContainer.firstChild);
        }
        // สร้าง Element ใหม่เพื่อแสดงรูปภาพที่อัพโหลดล่าสุด
        const imgElement = document.createElement('img');
        imgElement.src = uploadedImageUrl;
        imgElement.alt = 'Uploaded Image';
        imgElement.classList.add('max-w-[200px]'); // กำหนดสไตล์ CSS สำหรับขนาดรูปภาพ
        uploadedImageContainer.appendChild(imgElement);
    }
}

// ฟังก์ชันสำหรับคัดลอก URL
function copyUrl() {
    const imageUrlInput = document.getElementById('imageUrl');
    imageUrlInput.select();
    document.execCommand('copy');
    showNotification('คัดลอกที่อยู่รูปภาพสำเร็จ.');
}

// เรียกใช้ฟังก์ชันเพื่อแสดงรูปภาพที่อัพโหลดไปก่อนหน้า (หากมี)
displayUploadedImage();



document.addEventListener('paste', (event) => {
    const clipboardItems = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of clipboardItems) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            handlePastedImage(file);
            break;
        }
    }
});

function handlePastedImage(file) {

    if (file) {
        const now = Date.now();
        if (lastUploadTime && now - lastUploadTime < minUploadInterval) {
            showNotification('กรุณารอสักครู่ก่อนที่จะอัปโหลดรูปภาพอีกครั้ง', 'error');
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'png' && fileExtension !== 'jpg') {
            showNotification('กรุณาอัปโหลดไฟล์ .png หรือ .jpg เท่านั้น', 'error');
            return;
        }

        const maxSizeMB = 3;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file && file.size > maxSizeBytes) {
            showNotification(`ขนาดไฟล์เกิน ${maxSizeMB} MB กรุณาอัปโหลดรูปภาพที่มีขนาดน้อยกว่า ${maxSizeMB} MB`, 'error');
            return;
        }

        const uploadButton = document.getElementById('uploadButton');
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.classList.remove('hidden');
        uploadButton.disabled = true;
        const shouldRemoveBackground = false;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('removeBackground', shouldRemoveBackground);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const imageUrl = data.imageUrl;
            uploadedImageUrl = imageUrl;
            const imageUrlInput = document.getElementById('imageUrl');
            imageUrlInput.value = `http://${ipAddress}:3000${imageUrl}`;
            document.getElementById('imageUrlContainer').style.display = 'block';
            showNotification('อัพโหลดรูปภาพสำเร็จ.');
            loadingSpinner.classList.add('hidden');
            lastUploadTime = now; // บันทึกเวลาปัจจุบันเป็นเวลาล่าสุดที่มีการอัปโหลด
            uploadButton.disabled = false;
            displayUploadedImage();
        })
        .catch(error => console.error('Error:', error));
    }
}
