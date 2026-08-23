# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY dotNetBackend/*.sln ./dotNetBackend/

# Copy project files
COPY dotNetBackend/TorootoAPI.Domain/*.csproj ./dotNetBackend/TorootoAPI.Domain/
COPY dotNetBackend/TorootoAPI.Application/*.csproj ./dotNetBackend/TorootoAPI.Application/
COPY dotNetBackend/TorootoAPI.Infrastructure/*.csproj ./dotNetBackend/TorootoAPI.Infrastructure/
COPY dotNetBackend/TorootoASP/*.csproj ./dotNetBackend/TorootoASP/

WORKDIR /src/dotNetBackend
RUN dotnet restore

WORKDIR /src
COPY dotNetBackend/ ./dotNetBackend/

WORKDIR /src/dotNetBackend
RUN dotnet publish -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/out .

# Render exposes PORT via environment variable
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "TorootoASP.dll"]
