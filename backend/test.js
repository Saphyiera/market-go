const l = [[1, 'a']];

const updatedList = l.filter(([i]) => i !== 1); // Filtered array
updatedList.push([1, 'b']); // Add the new item
console.log(updatedList); // Logs the updated array: [[1, 'b']]
