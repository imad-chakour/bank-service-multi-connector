package ma.formations.multiconnector.service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.formations.multiconnector.enums.AccountStatus;

import java.util.Date;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class BankAccount {
    @Id
    @GeneratedValue
    private Long id;
    private String rib;
    private Double amount;
    private Date createdAt;
    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus;

    @ManyToOne
    private Customer customer;
    @OneToMany(mappedBy = "bankAccount")
    private List<BankAccountTransaction> bankAccountTransactionList;

    // Getters et setters manuels pour contourner le problème Lombok
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRib() { return rib; }
    public void setRib(String rib) { this.rib = rib; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    
    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }
    
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    
    public List<BankAccountTransaction> getBankAccountTransactionList() { return bankAccountTransactionList; }
    public void setBankAccountTransactionList(List<BankAccountTransaction> bankAccountTransactionList) { this.bankAccountTransactionList = bankAccountTransactionList; }

    // Builder manuel
    public static BankAccountBuilder builder() {
        return new BankAccountBuilder();
    }

    public static class BankAccountBuilder {
        private Long id;
        private String rib;
        private Double amount;
        private Date createdAt;
        private AccountStatus accountStatus;
        private Customer customer;
        private List<BankAccountTransaction> bankAccountTransactionList;

        public BankAccountBuilder rib(String rib) {
            this.rib = rib;
            return this;
        }

        public BankAccountBuilder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public BankAccountBuilder createdAt(Date createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public BankAccountBuilder accountStatus(AccountStatus accountStatus) {
            this.accountStatus = accountStatus;
            return this;
        }

        public BankAccountBuilder customer(Customer customer) {
            this.customer = customer;
            return this;
        }

        public BankAccountBuilder bankAccountTransactionList(List<BankAccountTransaction> bankAccountTransactionList) {
            this.bankAccountTransactionList = bankAccountTransactionList;
            return this;
        }

        public BankAccount build() {
            BankAccount bankAccount = new BankAccount();
            bankAccount.id = this.id;
            bankAccount.rib = this.rib;
            bankAccount.amount = this.amount;
            bankAccount.createdAt = this.createdAt;
            bankAccount.accountStatus = this.accountStatus;
            bankAccount.customer = this.customer;
            bankAccount.bankAccountTransactionList = this.bankAccountTransactionList;
            return bankAccount;
        }
    }
}
