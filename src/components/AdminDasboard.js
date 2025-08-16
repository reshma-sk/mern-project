import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_BACKEND_BASEURL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [openUserMenuId, setOpenUserMenuId] = useState(null);
  const [openProductMenuId, setOpenProductMenuId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/unauthorized");
    } else {
      fetchProducts();
      fetchUserCount();
    }
  }, []);

  async function fetchProducts() {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProducts(data.products);
      setProductCount(data.products.length);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  async function fetchUserCount() {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);

      setUsers(data);
      setUsersCount(data.length); // assuming this returns all users
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }

  async function promoteToAdmin(userId) {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(
        `${BASE_URL}/api/users/make-admin/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "User promoted successfully");
        fetchUserCount(); // refresh user list to show updated role
      } else {
        alert(data.message || "Failed to promote user");
      }
    } catch (err) {
      console.error("Error promoting user:", err);
      alert("An error occurred while promoting user.");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Total Products</h2>
          <p className="text-3xl">{productCount}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-3xl">{usersCount}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-3xl">0</p> {/* Replace with order count later */}
        </div>
      </div>

      {/* Product Grid */}
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => navigate("/createProduct")}
      >
        Add New Product
      </button>

      {/**user table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-2">{user.fullName}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2 capitalize">{user.role}</td>
                <td className="p-2 relative">
                  <button
                    onClick={() =>
                      setOpenUserMenuId((prevId) =>
                        prevId === user._id ? null : user._id
                      )
                    }
                    className="text-gray-600 text-xl font-bold px-2 py-1"
                  >
                    ⋮
                  </button>

                  {openUserMenuId === user._id && (
                    <div className="absolute right-0 z-10 mt-2 w-40 bg-white border rounded shadow-md">
                      <button
                        onClick={() => {
                          // ✅ Add actual edit logic later
                          console.log("Edit user", user._id);
                          setOpenUserMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          // ✅ Add actual delete logic later
                          console.log("Delete user", user._id);
                          setOpenUserMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 text-sm"
                      >
                        Delete
                      </button>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => {
                            promoteToAdmin(user._id);
                            setOpenUserMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-green-100 text-green-700 text-sm"
                        >
                          Promote to Admin
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded shadow relative">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{product.name}</h2>
                <p>${product.price}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>

              <button
                onClick={() =>
                  setOpenProductMenuId((prevId) =>
                    prevId === product._id ? null : product._id
                  )
                }
                className="text-gray-600 text-xl font-bold px-2"
              >
                ⋮
              </button>
            </div>

            {openProductMenuId === product._id && (
              <div className="absolute top-10 right-2 z-10 w-40 bg-white border rounded shadow-md">
                <button
                  onClick={() => {
                    // Implement edit product logic
                    console.log("Edit product", product._id);
                    setOpenProductMenuId(null);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    // Implement delete product logic
                    console.log("Delete product", product._id);
                    setOpenProductMenuId(null);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
