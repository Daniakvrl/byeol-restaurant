package com.wassimlagnaoui.RestaurantOrder.Mapper;

import com.wassimlagnaoui.RestaurantOrder.DTO.MenuItemRequest;
import com.wassimlagnaoui.RestaurantOrder.DTO.MenuItemResponse;
import com.wassimlagnaoui.RestaurantOrder.Exception.ResourceNotFoundException;
import com.wassimlagnaoui.RestaurantOrder.Repository.CategoryRepository;
import com.wassimlagnaoui.RestaurantOrder.model.Category;
import com.wassimlagnaoui.RestaurantOrder.model.MenuItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MenuItemMapper {

    private final CategoryRepository categoryRepository;

    public MenuItemResponse toResponse(MenuItem menuItem) {
        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .category(menuItem.getCategory() != null ? menuItem.getCategory().getName() : null)
                .imageUrl(menuItem.getImageUrl())
                .available(menuItem.isAvailable())
                .build();
    }

    public MenuItem toMenuItem(MenuItemRequest menuItemRequest) {
        Category category = categoryRepository.findByName(menuItemRequest.getCategory())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie inconnue : " + menuItemRequest.getCategory()));

        MenuItem menuItem = new MenuItem();
        menuItem.setName(menuItemRequest.getName());
        menuItem.setDescription(menuItemRequest.getDescription());
        menuItem.setPrice(menuItemRequest.getPrice());
        menuItem.setCategory(category);
        menuItem.setAvailable(menuItemRequest.isAvailable());
        menuItem.setImageUrl(menuItemRequest.getImageUrl());
        return menuItem;
    }

}