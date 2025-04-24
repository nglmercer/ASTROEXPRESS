const userObject = {
    idUsuario: 723,
    apodoUsuario: "test1234",
    correoUsuario: "test1234@gmail.com",
    claveUsuario: "$2y$12$ssS1TijjWS1Ou1jcbHWNc0.uOH5KWba5rvguJUv5MBK/nQVHVCyeJG",
    rolUsuario: 1,
    nsfwUsuario: 0, // Assuming 0 means false, 1 means true
    fechaCreacion: 1744951601000.0, // Assuming a numerical timestamp (e.g., milliseconds since epoch)
    apicode: null, // Empty in image
    fechaNacimiento: null, // Empty in image
    nombres: null, // Empty in image
    apellidos: null, // Empty in image
    state: null, // Empty in image
    country: 0, // Could represent a country ID, 0 or null if not set
    phone: null, // Empty in image
    preRegistrado: 1, // Assuming 0 means false, 1 means true
    creadorContenido: 0, // Assuming 0 means false, 1 means true
    anticipado: 0, // Assuming 0 means false, 1 means true
    fotoPerfilUsuario: null, // Empty in image (assuming a URL string or null)
    plan: 7,
    idUltimaTransaccion: null, // Empty in image (assuming a numeric ID or null)
    fechaUltimaTransaccion: null // Empty in image (assuming a numerical timestamp or null)
  };
  const userKeys = [
    'idUsuario',
    'apodoUsuario',
    'correoUsuario',
    'claveUsuario',
    'rolUsuario',
    'nsfwUsuario',
    'fechaCreacion',
    'apicode',
    'fechaNacimiento',
    'nombres',
    'apellidos',
    'state',
    'country',
    'phone',
    'preRegistrado',
    'creadorContenido',
    'anticipado',
    'fotoPerfilUsuario',
    'plan',
    'idUltimaTransaccion',
    'fechaUltimaTransaccion'
  ];
  
  interface Usuario {
    idUsuario: number;
    apodoUsuario: string;
    correoUsuario: string;
    claveUsuario: string; // Storing the password hash as a string
    rolUsuario: number;
    nsfwUsuario: number; // Typically 0 or 1, could potentially map to boolean
    fechaCreacion: number; // Assuming this is a numerical timestamp (e.g., milliseconds since epoch)
    apicode: string | null; // API code, could be string or null if unset
    fechaNacimiento: string | null; // Date of birth, could be string (like "YYYY-MM-DD") or null
    nombres: string | null; // First name(s), could be string or null
    apellidos: string | null; // Last name(s), could be string or null
    state: string | null; // State/Province, could be string or null
    country: number | null; // Country ID or code, 0 in example, but could be null if unset
    phone: string | null; // Phone number, could be string or null
    preRegistrado: number; // Pre-registered flag (0 or 1)
    creadorContenido: number; // Content creator flag (0 or 1)
    anticipado: number; // Anticipated flag (0 or 1)
    fotoPerfilUsuario: string | null; // Profile picture URL or path, could be string or null
    plan: number; // User plan ID or type
    idUltimaTransaccion: number | null; // ID of the last transaction, could be number or null
    fechaUltimaTransaccion: number | null; // Timestamp of the last transaction, could be number or null
  }
  
  // Example usage in TypeScript:
  const typedUserObject: Usuario = {
    idUsuario: 723,
    apodoUsuario: "test1234",
    correoUsuario: "test1234@gmail.com",
    claveUsuario: "$2y$12$ssS1TijjWS1Ou1jcbHWNc0.uOH5KWba5rvguJUv5MBK/nQVHVCyeJG",
    rolUsuario: 1,
    nsfwUsuario: 0,
    fechaCreacion: 1744951601000.0,
    apicode: null,
    fechaNacimiento: null,
    nombres: null,
    apellidos: null,
    state: null,
    country: 0,
    phone: null,
    preRegistrado: 1,
    creadorContenido: 0,
    anticipado: 0,
    fotoPerfilUsuario: null,
    plan: 7,
    idUltimaTransaccion: null,
    fechaUltimaTransaccion: null
  };
  
  const typedUsersArray: Usuario[] = [typedUserObject];