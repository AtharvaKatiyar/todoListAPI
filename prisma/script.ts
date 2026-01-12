import {prisma} from "../lib/prisma";

async function main() {
    const user = await prisma.user.create({
        data: {
            email: 'akash@gma.com',
            passwordHash: 'slifej3982',
            todos: {
                create: {
                    title: 'Do Homework'
                }
            }
 
        },

    })
    console.log(`Created User: ${user}`);
    const allUsers = await prisma.user.findMany({
        include: {
            todos: true,
        },
        
    })
    console.log('All users', JSON.stringify(allUsers, null, 2));
}
main().then(
    async() => {
        await prisma.$disconnect()
    }
).catch(async (e)=>{
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})