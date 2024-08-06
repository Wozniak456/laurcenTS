import { Button } from '@nextui-org/react'
import * as actions from '@/actions'
// import { auth } from "@/auth";
import Profile from '@/components/profile'

export default async function Home() {
  // const session = await auth();

  return (
    <div>
      <div className="flex m-2 justify-between items-center">
        <h1 className="text-xl font-bold">Home page</h1>
      </div>
      <div >
        {/* <form action={actions.signIn}>
          <Button type="submit">Sign In</Button>
        </form> */}

        {/* <form action={actions.signOut}>
          <Button type="submit">Sign out</Button>
        </form> */}

        {/* {
          session?.user 
          ? <div>{JSON.stringify(session.user)}</div> 
          : <div>Signed Out</div>
        }

        <Profile /> */}
        
      </div>
    </div>
  );
}
