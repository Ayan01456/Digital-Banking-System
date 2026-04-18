package account_service.client;

import account_service.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * name: The service name (used for logging/debugging)
 * url: The exact address of your Auth Service
 */
@FeignClient(name = "auth-service", url = "${AUTH_SERVICE_URL}")
public interface AuthClient {

    /**
     * This method must match the @GetMapping in your AuthController.
     * Since your AuthController has @RequestMapping("/api/auth"),
     * and the method has @GetMapping("/user/{id}"), the full path is:
     * /api/auth/user/{id}
     */
    @GetMapping("/api/auth/user/{id}")
    UserDTO getUserDetails(@PathVariable("id") Long id);

    @GetMapping("/api/auth/user/name/{username}")
    UserDTO getUserByName(@PathVariable("username") String username);

    @GetMapping("/api/auth/validate")
String getSubjectFromToken(@RequestParam("token") String token);
}