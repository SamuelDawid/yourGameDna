package rawgClient;

import dto.GameDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import rawgClientConfiguration.RawgClientConfiguration;

import java.util.List;

@FeignClient(value = "rawgFeignClient",url = "${rawg.base-url}", configuration = RawgClientConfiguration.class)
public interface RawgClient {
    @GetMapping("/games")
    List<GameDto> getGames(
            @RequestParam("search") String gameName,
            @RequestParam(value = "page_size",required = false) Integer pageSize
            );
}
