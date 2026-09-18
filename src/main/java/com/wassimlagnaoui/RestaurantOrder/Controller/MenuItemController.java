package com.wassimlagnaoui.RestaurantOrder.Controller;

import com.wassimlagnaoui.RestaurantOrder.DTO.MenuItemRequest;
import com.wassimlagnaoui.RestaurantOrder.DTO.MenuItemResponse;
import com.wassimlagnaoui.RestaurantOrder.Service.FileStorageService;
import com.wassimlagnaoui.RestaurantOrder.Service.MenuItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuItemController {

    private final MenuItemService menuItemService;
    private final FileStorageService fileStorageService;

    public MenuItemController(
            MenuItemService menuItemService,
            FileStorageService fileStorageService
    ) {
        this.menuItemService = menuItemService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value = "/add", consumes = "multipart/form-data")
    public ResponseEntity<MenuItemResponse> createMenuItem(
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("category") String category,
            @RequestParam("available") boolean available,
            @RequestParam(value = "description", required = false) String description,
            @RequestPart("image") MultipartFile image
    ) throws IOException {

        String imagePath = fileStorageService.saveImage(image);

        MenuItemRequest request = new MenuItemRequest();
        request.setName(name);
        request.setPrice(price);
        request.setCategory(category);
        request.setDescription(description);
        request.setAvailable(available);
        request.setImageUrl(imagePath);

        MenuItemResponse response = menuItemService.createMenuItem(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemService.findAll());
    }

    @GetMapping("/available")
    public ResponseEntity<List<MenuItemResponse>> getAvailableMenuItems() {
        return ResponseEntity.ok(menuItemService.findAvailable());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemResponse> updateAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(menuItemService.updateAvailability(id));
    }

    @PutMapping("/{id}/category")
    public ResponseEntity<MenuItemResponse> updateCategory(
            @PathVariable Long id,
            @RequestParam("category") String category
    ) {
        return ResponseEntity.ok(menuItemService.updateCategory(id, category));
    }

    @PutMapping("/{id}/price")
    public ResponseEntity<MenuItemResponse> updatePrice(
            @PathVariable Long id,
            @RequestParam("price") Double price
    ) {
        return ResponseEntity.ok(menuItemService.updatePrice(id, price));
    }

    @PutMapping("/{id}/name")
    public ResponseEntity<MenuItemResponse> updateName(
            @PathVariable Long id,
            @RequestParam("name") String name
    ) {
        return ResponseEntity.ok(menuItemService.updateName(id, name));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMenuItem(@PathVariable Long id) {
        menuItemService.delete(id);
        return ResponseEntity.ok("Menu item deleted successfully");
    }
}