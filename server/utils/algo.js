
// algorithm for merge and remove duplicate contacts order by desc
export const sortContactsListByDateDesc = (msg1, msg2) => {
        // console.log(new Date(msg1[0].latest_msg).getTime())
        const data = new Map()
        let i = 0, j = 0;
        while (msg1[i] || msg2[j]) {
            if (msg1[i] && msg2[j]) {
                if (new Date(msg1[i].latest_msg).getTime() > new Date(msg2[j].latest_msg).getTime()) {
                    if (data.has(msg1[i].sender)) {
                        if (new Date(data.get(msg1[i].sender).last_msg_at).getTime() < new Date(msg1[i].latest_msg).getTime()) {
                            data.set(msg1[i].sender, {last_msg_at: msg1[i].latest_msg})
                        }
                    } else {
                        data.set(msg1[i].sender, {last_msg_at: msg1[i].latest_msg})
                    }
                    i++
                } else {
                    if (data.has(msg2[j].reciver)) {
                        if (new Date(data.get(msg2[j].reciver).last_msg_at).getTime() < new Date(msg2[j].latest_msg).getTime()) {
                            data.set(msg2[j].reciver, {last_msg_at: msg2[j].latest_msg})
                        }
                    } else {
                        data.set(msg2[j].reciver, {last_msg_at: msg2[j].latest_msg})
                    }
                    j++
                }
            } else if (msg1[i]) {
                data.set(msg1[i].sender, {last_msg_at: msg1[i].latest_msg})
                i++
            } else {
                data.set(msg2[j].reciver, {last_msg_at: msg2[j].latest_msg})
                j++
            }
        }
    // console.log(data)
    const ndata = Object.fromEntries(data)
    const sortedContacts = Object.entries(ndata).sort((a, b) => {
        return new Date(b[1].last_msg_at) - new Date(a[1].last_msg_at)
    })
    // console.log(sortedContacts)
    const contactList = sortedContacts.map(item => {
        return {
            id: item[0],
            last_msg_at: item[1].last_msg_at
        }
    })
    // console.log(contactList)
    return contactList
}

// algorithm for merge two sorted list of messages
export const sortMessages = (msgs1, msgs2) => {
    // console.log(msgs1, msgs2)
    const res = []
    const date = (dateString) => new Date(dateString).getTime()
    let i = 0, j = 0 // using two pointer approch
    while (msgs1[i] || msgs2[j]) {
        if (msgs1[i] && msgs2[j]) {
            let [a, b] = [date(msgs1[i].sent_at), date(msgs2[j].sent_at)] 
            if (a < b) {
                res.push(msgs1[i])
                i++
            } else {
                res.push(msgs2[j])
                j++
            }
        } else if (msgs1[i]) {
            res.push(msgs1[i])
            i++
        } else {
            res.push(msgs2[j])
            j++
        }
    }
    return res
}