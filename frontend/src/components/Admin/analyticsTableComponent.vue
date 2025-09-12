<template> 
 <div class="max-dimensions p-4">
    <table class="table rounded table-bordered">
      <thead class="table-light">
        <tr>
          <th class="tr-padding" scope="col">Name</th>
          <th scope="col">Role</th>
          <th scope="col">Filings Uploaded</th>
          <th scope="col">Filings Reviewed</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <tr v-for="(data, index) in table_data" :key="index">
          <th scope="row">{{ data['name'] }}</th>
          <td><button class="btn rounded-pill btn-outline-info" disabled>{{ data['role'] }}</button></td>
          <td>{{ data['uploaded'] }}</td>
          <td>{{ data['reviewed'] }}</td>
          <td>
            <a href="#"><font-awesome-icon class="icon" icon="trash" @click="handleDelete(data['name'],data['id'])"/></a>
          </td>
        </tr>
      </tbody>
    </table>
    </div>


</template>

<script setup>


const table_data = [
  { id:'12344',name: 'Alice', role: 'Contributor', uploaded: 12, reviewed: 9 },
  { id:'12344',name: 'Bob', role: 'Reviewer', uploaded: 5, reviewed: 15 },
  { id:'12344',name: 'Charlie', role: 'Contributor', uploaded: 8, reviewed: 8 },
  { id:'12344',name: 'Diana', role: 'Reviewer', uploaded: 3, reviewed: 10 },
  { id:'12344',name: 'Ethan', role: 'Admin', uploaded: 20, reviewed: 18 },
  { id:'12344',name: 'Fiona', role: 'Contributor', uploaded: 6, reviewed: 6 },
];

const emit= defineEmits(['delete-user'])

function handleDelete(name,id){
    emit('delete-user',{ name, id })
    
}


</script>

<style scoped>
tr th, tr td {
  padding: 30px;
}

.max-dimensions{
    width: 60% !important;

}


</style>