package ma.formations.multiconnector.dtos.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddWirerTransferRequest {
    private String ribFrom;
    private String ribTo;
    private Double amount;
    private String username;

    // Getters et setters manuels pour contourner le problème Lombok
    public String getRibFrom() { return ribFrom; }
    public void setRibFrom(String ribFrom) { this.ribFrom = ribFrom; }
    
    public String getRibTo() { return ribTo; }
    public void setRibTo(String ribTo) { this.ribTo = ribTo; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
