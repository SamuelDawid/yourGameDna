package rawgClientConfiguration;

import customRawgErrorDecoder.RawgErrorDecoder;
import feign.RequestInterceptor;
import feign.Retryer;
import feign.codec.ErrorDecoder;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import java.util.concurrent.TimeUnit;

public class RawgClientConfiguration {
    @Bean
    public ErrorDecoder rawgErrorDecoder(){return new RawgErrorDecoder();
    }
    @Bean
    public Retryer retryer(){
        return new Retryer.Default(100L, TimeUnit.SECONDS.toMillis(2L),3);
    }
    @Bean
    public RequestInterceptor requestInterceptor(@Value("${rawg.api-key}") String key){
        return requestTemplate -> requestTemplate.query("key",key);
    }
}
