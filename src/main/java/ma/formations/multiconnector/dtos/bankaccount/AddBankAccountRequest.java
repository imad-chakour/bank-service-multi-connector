package ma.formations.multiconnector.dtos.bankaccount;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AddBankAccountRequest {
    private String rib;
    private Double amount;
    private String customerIdentityRef;

    // Getters et setters manuels pour contourner le problème Lombok
    public String getRib() { return rib; }
    public void setRib(String rib) { this.rib = rib; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public String getCustomerIdentityRef() { return customerIdentityRef; }
    public void setCustomerIdentityRef(String customerIdentityRef) { this.customerIdentityRef = customerIdentityRef; }
}
