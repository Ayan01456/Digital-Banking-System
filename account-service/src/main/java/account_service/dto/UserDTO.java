package account_service.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private BigDecimal Balance; // This must match the field name in your Auth service
}