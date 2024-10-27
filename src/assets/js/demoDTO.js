// Định nghĩa DTO
class UserDTO {
    constructor(id, username, email, password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }
}

// Giả lập dữ liệu
const mockUser = [
    new UserDTO(1, "darius", 'darius@gmail.com', '87654321'),
    new UserDTO(2, "yasuo", 'john@gmail.com', '12345678'),
];

// Hàm lấy dữ liệu
const fetchUsers = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockUser);
        }, 1000);
    });
};

// Xuất DTO và hàm fetchData
const fetchData = async () => {
    try {
        const users = await fetchUsers();
        console.log(users); // Xem dữ liệu trong console
        return users; // Đảm bảo trả về users
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

export { UserDTO, fetchData };
