import { FieldValue } from "firebase-admin/firestore";
import { firebaseAdmin } from "./firebase";

// Intended to be used with new members, no seperate createMember function.
export async function updateMember(id: string, leaderboard: string, options: { increment?: number, set?: number }) { 
    const db = firebaseAdmin.getFirestore();

    const ref = db.collection('leaderboards').doc(leaderboard).collection('points').doc(id);

    if(options.increment != undefined) {
        await ref.set({
            points: FieldValue.increment(options.increment)
        }, { merge: true });
    } else if(options.set != undefined) {
        await ref.set({
            points: options.set,
        }, { merge: true });
    } else {
        throw new Error("Neither set or increment was specified.");
    }
}

export async function getMember(id: string, leaderboard: string) { 
    const db = firebaseAdmin.getFirestore();

    const ref = db.collection('leaderboards').doc(leaderboard).collection('points').doc(id);

    const data = (await ref.get()).data();

    if(data == undefined) {
        return { id: id, points: 0 };
    } else {
        return { id: id, points: data.points };
    }
}

// Ranking does not get stored, have to fetch number of member with more points.
export async function getRank(leaderboard: string, id: string, points: number) {
    const db = firebaseAdmin.getFirestore();

    const ref = db.collection('leaderboards').doc(leaderboard).collection('points').where('points', '!=', 0).where('points', '>', points - 1);

    const docs = (await ref.orderBy('points', 'asc').limit(10).get()).docs;

    const count = (await ref.count().get()).data().count;

    const offset = docs.findIndex(doc => doc.ref.id == id); // In case there are multiple people with the same number of points

    return count - offset;
}


export async function getLeaderboard(leaderboard: string, page: number = 0) {
    const db = firebaseAdmin.getFirestore();

    const ref = db.collection('leaderboards').doc(leaderboard).collection('points').where('points', '!=', 0).orderBy('points', 'desc');

    const size = (await ref.count().get()).data().count;

    const docs = (await ref.offset(page * 10).limit(10).get()).docs;

    const entries = [] as { id: string, points: number }[];

    docs.forEach(entry => {
        if(entry.data() == undefined) return;

        entries.push({
            points: entry.data().points,
            id: entry.ref.id,
        });
    });

    return {
        size,
        entries
    }
}