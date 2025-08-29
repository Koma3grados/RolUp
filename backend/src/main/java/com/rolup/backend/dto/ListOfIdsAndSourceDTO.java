package com.rolup.backend.dto;

import com.rolup.backend.model.enums.Source;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ListOfIdsAndSourceDTO {
    private List<Long> listOfIds;
    private Source source;
}
