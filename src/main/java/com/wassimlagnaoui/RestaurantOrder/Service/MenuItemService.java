package com.wassimlagnaoui.RestaurantOrder.Service;


import com.wassimlagnaoui.RestaurantOrder.DTO.MenuItemRequest;
import com.wassimlagnaoui.RestaurantOrder.DTO.MenuItemResponse;
import com.wassimlagnaoui.RestaurantOrder.Exception.MenuItemIdNotFoundException;
import com.wassimlagnaoui.RestaurantOrder.Exception.MenuItemNotAvailableException;
import com.wassimlagnaoui.RestaurantOrder.Exception.ResourceNotFoundException;
import com.wassimlagnaoui.RestaurantOrder.Repository.CategoryRepository;
import com.wassimlagnaoui.RestaurantOrder.Repository.MenuItemRepository;
import com.wassimlagnaoui.RestaurantOrder.model.Category;
import com.wassimlagnaoui.RestaurantOrder.model.MenuItem;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;


import java.util.List;


@Service
@RequiredArgsConstructor
public class MenuItemService {


    private final MenuItemRepository menuItemRepository;

    private final CategoryRepository categoryRepository;


    /*
        CREATE
     */
    public MenuItemResponse createMenuItem(MenuItemRequest request) {


        Category category = categoryRepository.findByName(request.getCategory())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie inconnue : " + request.getCategory()));


        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .imageUrl(request.getImageUrl())
                .available(request.isAvailable())
                .build();


        MenuItem saved = menuItemRepository.save(item);


        return map(saved);

    }



    /*
        GET ALL
     */
    public List<MenuItemResponse> findAll() {


        return menuItemRepository.findAll()
                .stream()
                .map(this::map)
                .toList();

    }



    /*
        GET AVAILABLE
     */
    public List<MenuItemResponse> findAvailable() {


        return menuItemRepository
                .findByAvailableTrue()
                .stream()
                .map(this::map)
                .toList();

    }



    /*
       ancienne méthode utilisée par les tests
     */
    public List<MenuItemResponse> getAvailableMenuItems() {


        return menuItemRepository.findAll()
                .stream()
                .filter(MenuItem::isAvailable)
                .map(this::map)
                .toList();

    }



    /*
        FIND BY ID
     */
    public MenuItemResponse findById(Long id) {


        return map(findMenuItemById(id));

    }




    /*
        DELETE
     */
    public void delete(Long id) {


        if (!menuItemRepository.existsById(id)) {
            throw new MenuItemIdNotFoundException(id);
        }


        menuItemRepository.deleteById(id);

    }




    /*
        UPDATE AVAILABILITY (toggle)
     */
    public MenuItemResponse updateAvailability(Long id) {


        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(MenuItemNotAvailableException::new);


        item.setAvailable(!item.isAvailable());


        return map(menuItemRepository.save(item));

    }




    /*
        UPDATE AVAILABILITY (explicit value)
     */
    public MenuItemResponse updateAvailability(Long id, boolean available) {


        MenuItem item = findMenuItemById(id);


        item.setAvailable(available);


        return map(menuItemRepository.save(item));

    }




    /*
        UPDATE NAME
     */
    public MenuItemResponse updateName(Long id, String name) {


        MenuItem item = findMenuItemById(id);


        item.setName(name);


        return map(menuItemRepository.save(item));

    }




    /*
        UPDATE PRICE
     */
    public MenuItemResponse updatePrice(Long id, double price) {


        MenuItem item = findMenuItemById(id);


        item.setPrice(price);


        return map(menuItemRepository.save(item));

    }




    /*
        UPDATE CATEGORY
     */
    public MenuItemResponse updateCategory(Long id, String categoryName) {


        MenuItem item = findMenuItemById(id);


        Category category = categoryRepository.findByName(categoryName)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie inconnue : " + categoryName));


        item.setCategory(category);


        return map(menuItemRepository.save(item));

    }





    /*
       SEARCH CATEGORY
     */
    public List<MenuItemResponse> getMenuItemsByCategory(String categoryName) {


        Category category = categoryRepository.findByName(categoryName)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie inconnue : " + categoryName));


        return menuItemRepository
                .findByCategory(category)
                .stream()
                .map(this::map)
                .toList();

    }





    private MenuItem findMenuItemById(Long id) {


        return menuItemRepository.findById(id)
                .orElseThrow(() -> new MenuItemIdNotFoundException(id));

    }





    private MenuItemResponse map(MenuItem item) {


        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory() != null ? item.getCategory().getName() : null)
                .imageUrl(item.getImageUrl())
                .available(item.isAvailable())
                .build();

    }

}