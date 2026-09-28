// O Metro seleciona banco.web.ts no navegador e banco.native.ts no Android/iOS.
// Este arquivo mantém os tipos disponíveis para ferramentas que não fazem
// resolução por plataforma.
export * from './banco.native';
