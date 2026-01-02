package ma.formations.multiconnector.service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class GetTransactionListBo {
    private String rib;
    private Date dateTo;
    private Date dateFrom;

    // Getters et setters manuels pour contourner le problème Lombok
    public String getRib() { return rib; }
    public void setRib(String rib) { this.rib = rib; }
    
    public Date getDateTo() { return dateTo; }
    public void setDateTo(Date dateTo) { this.dateTo = dateTo; }
    
    public Date getDateFrom() { return dateFrom; }
    public void setDateFrom(Date dateFrom) { this.dateFrom = dateFrom; }
}
