# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy production project files only for a cached restore layer
COPY dotNetBackend/TorootoAPI.Domain/*.csproj ./dotNetBackend/TorootoAPI.Domain/
COPY dotNetBackend/TorootoAPI.Application/*.csproj ./dotNetBackend/TorootoAPI.Application/
COPY dotNetBackend/TorootoAPI.Infrastucture/*.csproj ./dotNetBackend/TorootoAPI.Infrastucture/
COPY dotNetBackend/TorootoASP/*.csproj ./dotNetBackend/TorootoASP/

# Restore only the startup project graph (excludes test projects)
RUN dotnet restore dotNetBackend/TorootoASP/TorootoASP.csproj

# Copy the backend source code
COPY dotNetBackend/ ./dotNetBackend/

# Publish the startup project using the restored dependency graph
RUN dotnet publish dotNetBackend/TorootoASP/TorootoASP.csproj -c Release --no-restore -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Render exposes PORT via environment variable
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "TorootoASP.dll"]
