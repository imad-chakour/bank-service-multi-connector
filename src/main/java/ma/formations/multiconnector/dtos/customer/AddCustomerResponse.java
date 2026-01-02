package ma.formations.multiconnector.dtos.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AddCustomerResponse {
    private String message;
    private Long id;
    private String username;
    private String identityRef;
    private String firstname;
    private String lastname;

    // Getters et setters manuels pour contourner le problème Lombok
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getIdentityRef() { return identityRef; }
    public void setIdentityRef(String identityRef) { this.identityRef = identityRef; }
    
    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }
    
    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }
}
