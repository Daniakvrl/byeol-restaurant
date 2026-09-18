package com.wassimlagnaoui.RestaurantOrder.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class FileStorageService {


    private final String uploadDir = "src/main/resources/static/images/";


    public String saveImage(MultipartFile file) throws IOException {


        if(file == null || file.isEmpty()){
            throw new IOException("Image file is empty");
        }


        Path path = Paths.get(uploadDir);


        if(!Files.exists(path)){
            Files.createDirectories(path);
        }


        String fileName =
                System.currentTimeMillis()
                + "_"
                + file.getOriginalFilename();


        Path filePath = path.resolve(fileName);


        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );


        return "/images/" + fileName;

    }

}