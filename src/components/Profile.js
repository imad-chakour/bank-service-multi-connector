import React, { useState, useEffect } from "react";
import AuthService from "../services/auth.service";

const Profile = () => {
  const [jwtToken, setJwtToken] = useState("");
  const [username, setUsername] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setJwtToken(user.jwtToken);
      setUsername(user.username);
      
      // Parser les rôles depuis le token JWT
      try {
        if (user.roles && Array.isArray(user.roles)) {
          setRoles(user.roles);
        } else if (user.roles && typeof user.roles === 'string') {
          const parsedRoles = JSON.parse(user.roles);
          setRoles(Array.isArray(parsedRoles) ? parsedRoles : []);
        } else {
          setRoles([]);
        }
      } catch (error) {
        console.error('Error parsing roles:', error);
        setRoles([]);
      }
    }
  }, []);

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>Username : {username}</h3>
        <br />
        <h3>Token : {jwtToken}</h3>
        <br />
        <h3>Roles list : </h3>
        <table className="table">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Role name</th>
            </tr>
          </thead>
          <tbody>
            {roles && roles.length > 0 ? (
              roles.map((role, index) => (
                <tr key={index}>
                  <td>{typeof role === 'string' ? role : role.authority || 'Unknown role'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td>No roles found</td>
              </tr>
            )}
          </tbody>
        </table>
      </header>
    </div>
  );
};

export default Profile;

