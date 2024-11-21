const test = async () => {
    const response = await fetch("http://localhost:2811/group-list?listId=1")

    const result = await response.json()
}

test()