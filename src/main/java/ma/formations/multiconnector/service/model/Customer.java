package ma.formations.multiconnector.service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@PrimaryKeyJoinColumn(name = "id")
public class Customer extends User {
    public Customer() {
        super((String) null);
    }

    public Customer(String identityRef, List<BankAccount> bankAccounts) {
        super((String) null);
        this.identityRef = identityRef;
        this.bankAccounts = bankAccounts;
    }
    @Column(unique = true)
    private String identityRef;
    @OneToMany(mappedBy = "customer")
    private List<BankAccount> bankAccounts;

    // Getters et setters manuels pour contourner le problème Lombok
    public String getIdentityRef() { return identityRef; }
    public void setIdentityRef(String identityRef) { this.identityRef = identityRef; }
    
    public List<BankAccount> getBankAccounts() { return bankAccounts; }
    public void setBankAccounts(List<BankAccount> bankAccounts) { this.bankAccounts = bankAccounts; }
}
