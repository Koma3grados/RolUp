package com.rolup.backend.controller;

import com.rolup.backend.config.security.SecurityUtils;
import com.rolup.backend.exception.ForbiddenException;
import com.rolup.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/file-manager")
public class FileStorageController {

    @Autowired
    private FileStorageService fileStorageService;

    // Listar archivos en un directorio
    @GetMapping("/list")
    public ResponseEntity<List<FileStorageService.FileInfo>> listFiles(
            @RequestParam(defaultValue = "") String path,
            Authentication auth) {

        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden acceder al gestor de archivos.");
        }

        try {
            List<FileStorageService.FileInfo> files = fileStorageService.listFiles(path);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Servir imagen
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> serveImage(
            @PathVariable String filename,
            @RequestParam(required = false) String path,
            Authentication auth) {

        try {
            Resource resource = fileStorageService.loadFileAsResource(filename, path);

            // Determinar content type usando MediaTypeFactory
            String contentType = MediaTypeFactory.getMediaType(resource)
                    .map(MediaType::toString)
                    .orElse("application/octet-stream");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Subir archivo
    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "") String path,
            Authentication auth) {

        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden subir archivos.");
        }

        try {
            String storedFilePath = fileStorageService.storeFile(file, path);
            String fileDownloadUri = "/api/file-manager/image/" + storedFilePath;

            UploadResponse response = new UploadResponse(
                    file.getOriginalFilename(),
                    storedFilePath,
                    fileDownloadUri,
                    file.getContentType(),
                    file.getSize()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Crear directorio
    @PostMapping("/directory")
    public ResponseEntity<Void> createDirectory(
            @RequestParam String path,
            @RequestParam String name,
            Authentication auth) {

        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden crear directorios.");
        }

        try {
            fileStorageService.createDirectory(path, name);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Eliminar archivo o directorio
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteFile(
            @RequestParam String path,
            @RequestParam boolean isDirectory,
            Authentication auth) {

        if (!SecurityUtils.isAdmin(auth)) {
            throw new ForbiddenException("Solo los administradores pueden eliminar archivos.");
        }

        try {
            if (isDirectory) {
                fileStorageService.deleteDirectory(path);
            } else {
                fileStorageService.deleteFile(path);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DTO para respuestas
    public record UploadResponse(
            String originalFileName,
            String storedFilePath,
            String fileDownloadUri,
            String fileType,
            long size
    ) {}
}