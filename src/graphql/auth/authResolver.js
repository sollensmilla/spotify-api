export const authResolver = {

    Mutation: {

        register: (_, { email, password }, { services }) =>
            services.userService.register(email, password),

        login: (_, { email, password }, { services }) =>
            services.userService.login(email, password)

    }

};