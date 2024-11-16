{
  description = "Dev deps and grafana with tempo service for tracing";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
    services-flake.url = "github:juspay/services-flake";
  };
  outputs = inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import inputs.systems;
      imports = [
        inputs.process-compose-flake.flakeModule
      ];
      perSystem = { self', pkgs, lib, ... }: {
        # `process-compose.foo` will add a flake package output called "foo".
        # Therefore, this will add a default package that you can build using
        # `nix build` and run using `nix run`.
        process-compose."default" = { config, ... }:
          let
            dbName = "sample";
          in
          {
            imports = [
              inputs.services-flake.processComposeModules.default
            ];

            services.tempo.tempo.enable = true;
            services.grafana.grafana = {
              enable = true;
              http_port = 4000;
              datasources = with config.services.tempo.tempo; [
                {
                  name = "Tempo";
                  type = "tempo";
                  access = "proxy";
                  url = "http://${httpAddress}:${builtins.toString httpPort}";
                  isDefault = true;
                }
              ];
              
            };
          };

        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [ 
						nodejs
						pnpm
           ];
        };
      };
    };
}
