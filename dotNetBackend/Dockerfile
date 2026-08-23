# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY dotNetBackend/*.sln ./dotNetBackend/

# Copy project files
COPY dotNetBackend/TorootoAPI.Domain/*.csproj ./dotNetBackend/TorootoAPI.Domain/
COPY dotNetBackend/TorootoAPI.Application/*.csproj ./dotNetBackend/TorootoAPI.Application/
COPY dotNetBackend/TorootoAPI.Infrastucture/*.csproj ./dotNetBackend/TorootoAPI.Infrastucture/
COPY dotNetBackend/TorootoASP/*.csproj ./dotNetBackend/TorootoASP/

# Restore using the exact solution file path from /src
RUN dotnet restore dotNetBackend/*.sln

# Copy the rest of the source code
COPY dotNetBackend/ ./dotNetBackend/

# Publish the startup project directly
RUN dotnet publish dotNetBackend/TorootoASP/TorootoASP.csproj -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Render exposes PORT via environment variable
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "TorootoASP.dll"]
