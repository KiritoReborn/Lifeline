package com.lifeline.openicu.routing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeline.openicu.routing.dto.RouteResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

/**
 * GraphHopper Cloud API implementation of RoutingService.
 * Uses the free tier of GraphHopper Directions API.
 * 
 * Design Decision: This is an EXTERNAL dependency.
 * Our contribution is the emergency decision layer on top.
 */
@Service
public class GraphHopperCloudService implements RoutingService {

    private static final Logger log = LoggerFactory.getLogger(GraphHopperCloudService.class);
    private static final String GRAPHHOPPER_API_URL = "https://graphhopper.com/api/1/route";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GraphHopperCloudService(@Value("${graphhopper.api.key:}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey;
        log.info("GraphHopper service initialized. API key configured: {}", !apiKey.isEmpty());
    }

    @Override
    public RouteResponse getRoute(double fromLat, double fromLon, double toLat, double toLon) {
        return getRoute(fromLat, fromLon, toLat, toLon, "car");
    }

    @Override
    public RouteResponse getRoute(double fromLat, double fromLon, double toLat, double toLon, String profile) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("GraphHopper API key not configured. Using straight-line fallback.");
            return createFallbackRoute(fromLat, fromLon, toLat, toLon);
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl(GRAPHHOPPER_API_URL)
                    .queryParam("point", fromLat + "," + fromLon)
                    .queryParam("point", toLat + "," + toLon)
                    .queryParam("profile", profile) // "car" for default fastest routing
                    .queryParam("locale", "en")
                    .queryParam("points_encoded", "true")
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            log.info("Calling GraphHopper API: {}→{}",
                    String.format("%.4f,%.4f", fromLat, fromLon),
                    String.format("%.4f,%.4f", toLat, toLon));

            String response = restTemplate.getForObject(url, String.class);
            return parseResponse(response);

        } catch (Exception e) {
            log.error("GraphHopper API call failed: {}", e.getMessage());
            return createFallbackRoute(fromLat, fromLon, toLat, toLon);
        }
    }

    /**
     * Parse GraphHopper API response.
     */
    private RouteResponse parseResponse(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);

        if (root.has("paths") && root.get("paths").isArray() && root.get("paths").size() > 0) {
            JsonNode path = root.get("paths").get(0);

            double distance = path.get("distance").asDouble();
            long time = path.get("time").asLong();
            String encodedPolyline = path.get("points").asText();

            // Decode polyline to coordinates
            List<double[]> coordinates = decodePolyline(encodedPolyline);

            log.info("Route calculated: {:.1f}km, {} min", distance / 1000, time / 60000);
            return new RouteResponse(distance, time, coordinates, encodedPolyline);
        }

        throw new RuntimeException("Invalid GraphHopper response");
    }

    /**
     * Decode Google-style encoded polyline to lat/lon coordinates.
     * Standard algorithm used by GraphHopper and Google Maps.
     */
    public static List<double[]> decodePolyline(String encoded) {
        List<double[]> poly = new ArrayList<>();
        int index = 0, len = encoded.length();
        int lat = 0, lng = 0;

        while (index < len) {
            int b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            int dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            poly.add(new double[] { lat / 1e5, lng / 1e5 });
        }

        return poly;
    }

    /**
     * Fallback: Create straight-line route when API is unavailable.
     * Uses Haversine formula for distance estimation.
     */
    private RouteResponse createFallbackRoute(double fromLat, double fromLon, double toLat, double toLon) {
        // Haversine distance
        double R = 6371000; // Earth radius in meters
        double dLat = Math.toRadians(toLat - fromLat);
        double dLon = Math.toRadians(toLon - fromLon);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(fromLat)) * Math.cos(Math.toRadians(toLat)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;

        // Estimate time at 40 km/h average speed
        long time = (long) ((distance / 40000) * 3600000);

        // Create simple 2-point path
        List<double[]> coordinates = List.of(
                new double[] { fromLat, fromLon },
                new double[] { toLat, toLon });

        log.info("Fallback route: {:.1f}km, {} min (straight-line)", distance / 1000, time / 60000);
        return new RouteResponse(distance, time, coordinates, null);
    }
}
