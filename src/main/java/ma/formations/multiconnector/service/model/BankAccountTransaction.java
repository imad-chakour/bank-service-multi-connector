package ma.formations.multiconnector.service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.formations.multiconnector.enums.TransactionType;

import java.util.Date;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class BankAccountTransaction {
    @Id
    @GeneratedValue
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;
    private Double amount;
    @ManyToOne
    private BankAccount bankAccount;

    @ManyToOne
    private User user;

    // Getters et setters manuels pour contourner le problème Lombok
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    
    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public BankAccount getBankAccount() { return bankAccount; }
    public void setBankAccount(BankAccount bankAccount) { this.bankAccount = bankAccount; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Builder manuel
    public static BankAccountTransactionBuilder builder() {
        return new BankAccountTransactionBuilder();
    }

    public static class BankAccountTransactionBuilder {
        private Long id;
        private Date createdAt;
        private TransactionType transactionType;
        private Double amount;
        private BankAccount bankAccount;
        private User user;

        public BankAccountTransactionBuilder amount(Double amount) {
            this.amount = amount;
            return this;
        }

        public BankAccountTransactionBuilder transactionType(TransactionType transactionType) {
            this.transactionType = transactionType;
            return this;
        }

        public BankAccountTransactionBuilder bankAccount(BankAccount bankAccount) {
            this.bankAccount = bankAccount;
            return this;
        }

        public BankAccountTransactionBuilder user(User user) {
            this.user = user;
            return this;
        }

        public BankAccountTransactionBuilder createdAt(Date createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public BankAccountTransaction build() {
            BankAccountTransaction transaction = new BankAccountTransaction();
            transaction.id = this.id;
            transaction.createdAt = this.createdAt;
            transaction.transactionType = this.transactionType;
            transaction.amount = this.amount;
            transaction.bankAccount = this.bankAccount;
            transaction.user = this.user;
            return transaction;
        }
    }
}
