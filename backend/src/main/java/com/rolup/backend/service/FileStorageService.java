package com.rolup.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        // Usar ruta relativa al directorio de trabajo
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Crear directorio si no existe
        if (!Files.exists(this.fileStorageLocation)) {
            try {
                Files.createDirectories(this.fileStorageLocation);
            } catch (IOException e) {
                throw new RuntimeException("Could not create upload directory: " + this.fileStorageLocation, e);
            }
        }
    }

    public Resource loadFileAsResource(String filename, String path) throws Exception {
        try {
            String filePath = path != null && !path.isEmpty() ? path + "/" + filename : filename;
            Path fullPath = this.fileStorageLocation.resolve(filePath).normalize();
            Resource resource = new UrlResource(fullPath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new Exception("File not found: " + filename);
            }
        } catch (MalformedURLException ex) {
            throw new Exception("File not found: " + filename, ex);
        }
    }

    public String storeFile(MultipartFile file, String relativePath) {
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        if (fileName.isEmpty()) {
            throw new RuntimeException("File name cannot be null or empty");
        }

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Invalid file name: " + fileName);
            }

            // Crear directorio si no existe
            Path targetDir = this.fileStorageLocation.resolve(relativePath);
            Files.createDirectories(targetDir);

            // Generar nombre único
            String uniqueFileName = UUID.randomUUID() + "_" + fileName;
            Path targetLocation = targetDir.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return relativePath.isEmpty() ? uniqueFileName : relativePath + "/" + uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }

    public Resource loadFile(String filePath) {
        try {
            Path fullPath = this.fileStorageLocation.resolve(filePath).normalize();
            Resource resource = new UrlResource(fullPath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filePath, ex);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path fullPath = this.fileStorageLocation.resolve(filePath).normalize();
            Files.deleteIfExists(fullPath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file: " + filePath, ex);
        }
    }

    public List<FileInfo> listFiles(String relativePath) {
        Path directory = this.fileStorageLocation.resolve(relativePath);

        if (!Files.exists(directory) || !Files.isDirectory(directory)) {
            return Collections.emptyList();
        }

        try (Stream<Path> paths = Files.list(directory)) {
            return paths.map(path -> {
                        String fileName = path.getFileName().toString();
                        boolean isDirectory = Files.isDirectory(path);
                        long size = isDirectory ? 0 : path.toFile().length();
                        String relativeFilepath = relativePath.isEmpty() ?
                                fileName : relativePath + "/" + fileName;

                        return new FileInfo(
                                fileName,
                                relativeFilepath,
                                isDirectory,
                                size,
                                getFileExtension(fileName)
                        );
                    })
                    .sorted((a, b) -> {
                        // Directorios primero, luego archivos alfabéticamente
                        if (a.isDirectory() && !b.isDirectory()) return -1;
                        if (!a.isDirectory() && b.isDirectory()) return 1;
                        return a.name().compareToIgnoreCase(b.name());
                    })
                    .collect(Collectors.toList());
        } catch (IOException ex) {
            throw new RuntimeException("Could not list files in: " + relativePath, ex);
        }
    }

    public void createDirectory(String relativePath, String directoryName) {
        try {
            Path newDir = this.fileStorageLocation.resolve(relativePath).resolve(directoryName);
            Files.createDirectories(newDir);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create directory: " + directoryName, ex);
        }
    }

    public void deleteDirectory(String relativePath) {
        try {
            Path directory = this.fileStorageLocation.resolve(relativePath);
            if (Files.exists(directory) && Files.isDirectory(directory)) {
                try (Stream<Path> paths = Files.walk(directory)) {
                    paths.sorted(Comparator.reverseOrder())
                            .forEach(path -> {
                                try {
                                    Files.deleteIfExists(path);
                                } catch (IOException e) {
                                    throw new RuntimeException("Could not delete: " + path, e);
                                }
                            });
                }
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete directory: " + relativePath, ex);
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex == -1 ? "" : filename.substring(lastDotIndex + 1);
    }

    public record FileInfo(
            String name,
            String path,
            boolean isDirectory,
            long size,
            String extension
    ) {}
}