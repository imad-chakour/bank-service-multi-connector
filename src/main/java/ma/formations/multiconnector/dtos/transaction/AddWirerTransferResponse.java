package ma.formations.multiconnector.dtos.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddWirerTransferResponse {
    private String message;
    private TransactionDto transactionFrom;
    private TransactionDto transactionTo;

    // Getters et setters manuels pour contourner le problème Lombok
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public TransactionDto getTransactionFrom() { return transactionFrom; }
    public void setTransactionFrom(TransactionDto transactionFrom) { this.transactionFrom = transactionFrom; }
    
    public TransactionDto getTransactionTo() { return transactionTo; }
    public void setTransactionTo(TransactionDto transactionTo) { this.transactionTo = transactionTo; }

    // Builder manuel
    public static AddWirerTransferResponseBuilder builder() {
        return new AddWirerTransferResponseBuilder();
    }

    public static class AddWirerTransferResponseBuilder {
        private String message;
        private TransactionDto transactionFrom;
        private TransactionDto transactionTo;

        public AddWirerTransferResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public AddWirerTransferResponseBuilder transactionFrom(TransactionDto transactionFrom) {
            this.transactionFrom = transactionFrom;
            return this;
        }

        public AddWirerTransferResponseBuilder transactionTo(TransactionDto transactionTo) {
            this.transactionTo = transactionTo;
            return this;
        }

        public AddWirerTransferResponse build() {
            AddWirerTransferResponse response = new AddWirerTransferResponse();
            response.message = this.message;
            response.transactionFrom = this.transactionFrom;
            response.transactionTo = this.transactionTo;
            return response;
        }
    }
}
