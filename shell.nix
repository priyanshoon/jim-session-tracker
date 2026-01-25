{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
    buildInputs = with pkgs; [
        nodejs_24
        pnpm
        sqlite
        httpyac
        redis
    ];

    shellHook = ''
      echo "nix shell env"
    '';
}
