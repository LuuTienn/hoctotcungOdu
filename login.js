import { db } from './firebase.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const greetingElement = document.getElementById('greeting');
const logoutButton = document.getElementById('logoutButton');

// Sự kiện khi trang được tải
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Lấy thông tin người dùng đã đăng nhập từ Firebase
        const loggedInUserId = sessionStorage.getItem('loggedInUserId');
        if (loggedInUserId) {
            const userRef = collection(db, "users");
            const q = query(userRef, where("id", "==", loggedInUserId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                const { username, role } = userData;

                // Hiển thị lời chào
                greetingElement.innerText = `Chào mừng ${role === 'giaovien' ? 'cô' : 'bạn'}: ${username}`;
                logoutButton.style.display = 'none'; // Hiển thị nút đăng xuất
            } else {
                greetingElement.innerText = 'Chào mừng thầy/cô đến với trang web học tốt cùng Odu!';
                logoutButton.style.display = 'block'; // Ẩn nút đăng xuất
            }
        } else {
            greetingElement.innerText = 'Chào mừng bạn đến với trang web học tốt cùng Odu!';
            logoutButton.style.display = 'block'; // Ẩn nút đăng xuất
        }

        // Xử lý đăng nhập
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Xử lý đăng xuất
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
    } catch (error) {
        console.error("Lỗi khi tải trang:", error);
    }
});

// Hàm xử lý đăng nhập
async function handleLogin(event) {
    event.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("phone", "==", phone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.password === password) {
                const userRole = userData.role.toLowerCase();
                console.log("Vai trò của người dùng:", userRole);
            
                localStorage.setItem('loggedInUser', JSON.stringify(userData));
            
            // Kiểm tra vai trò và điều hướng
            if (userRole === 'giaovien') {
                window.location.href = "./Trangchugv.html";
            } else if (userRole === 'hocsinh') {
                window.location.href = "./Trangchuhs.html";
            } else {
                alert("Vai trò không hợp lệ!");
            }
            } else {
            alert("Mật khẩu không đúng!");
            }
                } else {
                    alert("Số điện thoại không tồn tại!");
                }
            } catch (error) {
                console.error("Lỗi khi đăng nhập:", error);
                alert("Đã xảy ra lỗi khi đăng nhập.");
            }
        }


// Hàm xử lý đăng xuất
function handleLogout() {
    sessionStorage.removeItem('loggedInUserId'); // Xóa ID người dùng trong sessionStorage
    greetingElement.innerText = 'Chào mừng đến với trang web học tốt cùng Odu!';
    logoutButton.style.display = 'none'; // Ẩn nút đăng xuất
    alert("Đăng xuất thành công!");
    window.location.href = "./Trangchu.html";
}