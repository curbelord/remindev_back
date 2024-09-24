import z from "zod";


export class UserSchema {
    static _schema = z.object({
        name: z.string().regex(/^([A-ZÁÉÍÓÚ][a-záéíóú]+)( [A-ZÁÉÍÓÚ][a-záéíóú]+){0,2}$/),
        surname: z.string().regex(/^([A-ZÁÉÍÓÚ][a-záéíóúñ]{1,})( [A-ZÁÉÍÓÚ][a-záéíóúñ]{1,})?$/),
        birthdate: z.string().regex(/^(?:(19|20)\d{2})-(0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])$|^(?:(19|20)\d{2})-(0[469]|11)-(0[1-9]|[12][0-9]|30)$|^(?:(19|20)(?:[02468][048]|[13579][26]))-02-(0[1-9]|1[0-9]|2[0-9])$|^(?:(19|20)(?:[0-9]{2}))-02-(0[1-9]|1[0-9]|2[0-8])$/),
        nick: z.string().regex(/^[A-Za-z0-9_-]{6,18}$/),
        company: z.string().regex(/^[A-Za-z0-9 ]{1,255}$/),
        occupation: z.string().regex(/^[A-Za-z0-9 ]{1,255}$/),
        email: z.string().email(),
        password: z.string().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&\/()=?¿¡^*+,.-])[A-Za-z\d!@#$%&\/()=?¿¡^*+,.-]{8,16}/),
        fullRegistration: z.boolean()
    }).partial();

    static fullUser = UserSchema._schema.required({
        name: true,
        surname: true,
        birthdate: true,
        nick: true,
        occupation: true,
        email: true,
        password: true
    });

    static partialUser = UserSchema._schema.required({
        password: true
    });

    static validateUser = async (user) => {
        return await UserSchema.fullUser.safeParseAsync(user);
    }

    static validatePartialUser = async (user, isLogin) => {
        if (isLogin){
            UserSchema.partialUser = UserSchema._schema.required({
                ...UserSchema.partialUser,
                nick: true
            });
        }
    
        return await UserSchema.partialUser.safeParseAsync(user);
    }
}