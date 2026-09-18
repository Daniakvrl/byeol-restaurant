package com.wassimlagnaoui.RestaurantOrder.DTO;


import lombok.Data;
import org.springframework.web.multipart.MultipartFile;


@Data
public class MenuItemRequest {


    private String name;


    private String description;


    private double price;


    private String category;


    private MultipartFile image;


    private String imageUrl;


    private boolean available = true;

}