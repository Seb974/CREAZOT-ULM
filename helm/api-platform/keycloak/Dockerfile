# #syntax=docker/dockerfile:1.4




# # Versions
# FROM bitnami/keycloak:24-debian-12 AS keycloak_upstream


# # The different stages of this Dockerfile are meant to be built into separate images
# # https://docs.docker.com/develop/develop-images/multistage-build/#stop-at-a-specific-build-stage
# # https://docs.docker.com/compose/compose-file/#target


# # Keycloak image
# FROM keycloak_upstream AS keycloak

# COPY --link themes/api-platform-demo /opt/bitnami/keycloak/themes/api-platform-demo
# COPY --link providers/owner-policy.jar /opt/bitnami/keycloak/providers/owner-policy.jar
# syntax=docker/dockerfile:1.4

# Base officielle Keycloak (remplace Bitnami)
# FROM quay.io/keycloak/keycloak:24.0.5 AS keycloak_upstream
# Keycloak 24.0.5 (Quarkus)
FROM quay.io/keycloak/keycloak@sha256:f8ade94c1d0ad2f2fa7734a455fee5392764f402c43ca35e9af6bf63a2541dc9 AS keycloak_upstream

# Construction finale
FROM keycloak_upstream AS keycloak

COPY themes/api-platform-demo /opt/keycloak/themes/api-platform-demo
COPY providers/owner-policy.jar /opt/keycloak/providers/owner-policy.jar

# Copier Keycloak Config CLI pour prod
COPY keycloak-config-cli.jar /opt/keycloak/bin/keycloak-config-cli.jar

# Script de démarrage flexible
COPY entrypoint.sh /opt/keycloak/entrypoint.sh
ENTRYPOINT ["/bin/bash", "/opt/keycloak/entrypoint.sh"]
# RUN chmod +x /opt/keycloak/entrypoint.sh

# ENTRYPOINT ["/opt/keycloak/entrypoint.sh"]