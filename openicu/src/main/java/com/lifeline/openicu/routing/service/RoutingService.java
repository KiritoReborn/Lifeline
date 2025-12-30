package com.lifeline.openicu.routing.service;

import com.lifeline.openicu.routing.dto.RouteResponse;

/**
 * Routing service interface for calculating routes between points.
 * This abstraction allows swapping implementations (Cloud vs Self-hosted).
 */
public interface RoutingService {

    /**
     * Calculate route between two points.
     *
     * @param fromLat Starting latitude
     * @param fromLon Starting longitude
     * @param toLat   Destination latitude
     * @param toLon   Destination longitude
     * @return RouteResponse with distance, ETA, and path
     */
    RouteResponse getRoute(double fromLat, double fromLon, double toLat, double toLon);

    /**
     * Calculate route with vehicle profile.
     *
     * @param fromLat Starting latitude
     * @param fromLon Starting longitude
     * @param toLat   Destination latitude
     * @param toLon   Destination longitude
     * @param profile Vehicle profile (e.g., "car", "emergency")
     * @return RouteResponse with distance, ETA, and path
     */
    RouteResponse getRoute(double fromLat, double fromLon, double toLat, double toLon, String profile);
}
