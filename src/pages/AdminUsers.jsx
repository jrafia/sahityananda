import { useState } from "react";

function AdminUsers() {
  const [search, setSearch] = useState("");

  const users = [
    {
      name: "Jannatul Rafia",
      email: "jannatulrafia0@gmail.com",
      role: "Admin",
      status: "Active",
    },
  ];

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="users-page">

      {/* Header */}

      <div className="users-page-header">

        <div>
          <h1>Users</h1>
          <p> User </p>
        </div>

        <button className="create-user-btn">
          + Create User
        </button>

      </div>

      {/* Toolbar */}

      <div className="users-toolbar">

        <div className="user-search">

          <span>??</span>

          <input
            type="text"
            placeholder="Name ?? Email ???? ??????..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="user-count">
          ??? {filteredUsers.length} ??
        </div>

      </div>

      {/* Users Table */}

      <div className="users-table-container">

        <table className="users-table">

          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredUsers.length > 0 ? (

              filteredUsers.map((user, index) => (

                <tr key={index}>

                  <td>

                    <div className="table-user">

                      <div className="table-avatar">
                        {user.name.charAt(0)}
                      </div>

                      <strong>
                        {user.name}
                      </strong>

                    </div>

                  </td>

                  <td className="user-email">
                    {user.email}
                  </td>

                  <td>

                    <span className="role-badge">
                      {user.role}
                    </span>

                  </td>

                  <td>

                    <span className="status-badge">
                      ? {user.status}
                    </span>

                  </td>

                  <td>

                    <button className="action-btn">
                      ?
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#888",
                  }}
                >
                  ???? User ????? ?????
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminUsers;