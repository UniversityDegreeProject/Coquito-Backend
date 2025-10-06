import zod from "zod";


export const loginUserSchema = zod.object({
  username: zod
    .string({ error: "Usuario es requerido" })
    .min(1, { error: "El usuario no puede estar vacio" }),
  password: zod
    .string({ error: "Contraseña es requerida" })
    .min(6, { error: "Contraseña debe tener al menos 6 caracteres" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      { 
        error: "Contraseña debe tener al menos una letra mayuscula, una letra minuscula, un numero y un caracter especial" 
      }
    )
    .max(16, { error: "Contraseña debe tener menos de 16 caracteres" }),
});


export type LoginUserSchema = zod.infer<typeof loginUserSchema>;