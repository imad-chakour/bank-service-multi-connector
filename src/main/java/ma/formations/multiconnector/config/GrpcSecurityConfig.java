package ma.formations.multiconnector.config;

import io.grpc.Metadata;
import io.grpc.ServerCall;
import net.devh.boot.grpc.server.security.authentication.GrpcAuthenticationReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;

@Configuration
public class GrpcSecurityConfig {

    @Bean
    public GrpcAuthenticationReader grpcAuthenticationReader() {
        return new GrpcAuthenticationReader() {
            @Override
            public Authentication readAuthentication(ServerCall<?, ?> call, Metadata metadata) {
                // Return null to indicate no authentication is required
                // This disables automatic gRPC security
                return null;
            }
        };
    }
}

