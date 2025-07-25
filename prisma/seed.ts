import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed summer camp batch data...')

  // Healthcare Summer Camp data (Jul 11)
  const healthcareData = [
    { courseName: 'Healthcare Summer Camp', studentName: 'My Life', contactNumber: '9266132036' },
    { courseName: 'Healthcare Summer Camp', studentName: 'Samanvita Gollamudi Vasudha', contactNumber: '9618015434' },
    { courseName: 'Healthcare Summer Camp', studentName: 'Ankita Bistu', contactNumber: '9932845132' },
    { courseName: 'Healthcare Summer Camp', studentName: 'Rafiya', contactNumber: '8709408033' },
    { courseName: 'Healthcare Summer Camp', studentName: 'Kushad Narain Singh', contactNumber: '9305518296' },
  ]

  // GenAI Summer Camp data (Jul 27)
  const genAIData = [
    { courseName: 'GenAI Summer Camp', studentName: 'Vivek Kumar Choudhary', contactNumber: '9871261371' },
    { courseName: 'GenAI Summer Camp', studentName: 'Yashoveer Saini', contactNumber: '9882075799' },
    { courseName: 'GenAI Summer Camp', studentName: 'Harsh Kumar', contactNumber: '8766238669' },
    { courseName: 'GenAI Summer Camp', studentName: 'ROYAL XSCOUT', contactNumber: '9336272692' },
    { courseName: 'GenAI Summer Camp', studentName: 'Prayas Dash', contactNumber: '9958146750' },
    { courseName: 'GenAI Summer Camp', studentName: 'Parth Sharma', contactNumber: '9329489537' },
    { courseName: 'GenAI Summer Camp', studentName: 'Sejal', contactNumber: '8936098305' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ikshita Singh Singh', contactNumber: '7000879391' },
    { courseName: 'GenAI Summer Camp', studentName: 'Amit Kumar Verma', contactNumber: '9335659414' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ankit Kumar', contactNumber: '7004387697' },
    { courseName: 'GenAI Summer Camp', studentName: 'Shahid Rashid', contactNumber: '8310298253' },
    { courseName: 'GenAI Summer Camp', studentName: 'Kamal', contactNumber: '7007856976' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ariket Mitra', contactNumber: '7001622349' },
    { courseName: 'GenAI Summer Camp', studentName: 'Patil Swapnil Swapnil', contactNumber: '8141190748' },
    { courseName: 'GenAI Summer Camp', studentName: 'Aditi Deoli', contactNumber: '9650974545' },
    { courseName: 'GenAI Summer Camp', studentName: 'Pallavi C', contactNumber: '9632000405' },
    { courseName: 'GenAI Summer Camp', studentName: 'Syed Zakir Habib', contactNumber: '9415260560' },
    { courseName: 'GenAI Summer Camp', studentName: 'Shaurya Prajapati', contactNumber: '9208084296' },
    { courseName: 'GenAI Summer Camp', studentName: 'Parth Singhal', contactNumber: '9760114290' },
    { courseName: 'GenAI Summer Camp', studentName: 'Arya Rajvee', contactNumber: '7004819031' },
    { courseName: 'GenAI Summer Camp', studentName: 'Anushka', contactNumber: '9518947168' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ishika Singh', contactNumber: '7004294768' },
    { courseName: 'GenAI Summer Camp', studentName: 'Arfi', contactNumber: '7520329763' },
    { courseName: 'GenAI Summer Camp', studentName: 'Aarav Dhiman', contactNumber: '8087873743' },
    { courseName: 'GenAI Summer Camp', studentName: 'Bhagwat', contactNumber: '9922674706' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ritabrata Dey', contactNumber: '6295043287' },
    { courseName: 'GenAI Summer Camp', studentName: 'Nilima Borkar', contactNumber: '7900192316' },
    { courseName: 'GenAI Summer Camp', studentName: 'Dibyaprakash Sara', contactNumber: '9082627910' },
    { courseName: 'GenAI Summer Camp', studentName: 'Prachi Prachi', contactNumber: '6283295099' },
    { courseName: 'GenAI Summer Camp', studentName: 'Jinit', contactNumber: '9673116591' },
    { courseName: 'GenAI Summer Camp', studentName: 'Mohammed Ali Kasmani', contactNumber: '9744013335' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ammar', contactNumber: '9945519742' },
    { courseName: 'GenAI Summer Camp', studentName: 'Adhvik Manchanda', contactNumber: '9315256699' },
    { courseName: 'GenAI Summer Camp', studentName: 'Anurag Ray', contactNumber: '9434142120' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ananya Devendra Patil patil', contactNumber: '9552196137' },
    { courseName: 'GenAI Summer Camp', studentName: 'Sm Ataur Rahman', contactNumber: '8328949406' },
    { courseName: 'GenAI Summer Camp', studentName: 'Aarib Akhter', contactNumber: '8141411287' },
    { courseName: 'GenAI Summer Camp', studentName: 'Aditya Singh', contactNumber: '9980400355' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ashutosh Majhi', contactNumber: '7978705040' },
    { courseName: 'GenAI Summer Camp', studentName: 'VIRAT YADAV', contactNumber: '9899092408' },
    { courseName: 'GenAI Summer Camp', studentName: 'Divyaansh', contactNumber: '8583837802' },
    { courseName: 'GenAI Summer Camp', studentName: 'Pratiksha', contactNumber: '8971343714' },
    { courseName: 'GenAI Summer Camp', studentName: 'Aishani Lahiri', contactNumber: '6372122399' },
    { courseName: 'GenAI Summer Camp', studentName: 'Souvik Dey', contactNumber: '8210939036' },
    { courseName: 'GenAI Summer Camp', studentName: 'Garvita Singh', contactNumber: '8840469995' },
    { courseName: 'GenAI Summer Camp', studentName: 'Kira Yagami', contactNumber: '9407413138' },
    { courseName: 'GenAI Summer Camp', studentName: 'Nirlesh', contactNumber: '7978021560' },
    { courseName: 'GenAI Summer Camp', studentName: 'Hardeek Ranjan', contactNumber: '8409320581' },
    { courseName: 'GenAI Summer Camp', studentName: 'param shiv', contactNumber: '9472268701' },
    { courseName: 'GenAI Summer Camp', studentName: 'Satayu Kundu', contactNumber: '8420319737' },
    { courseName: 'GenAI Summer Camp', studentName: 'Kritika', contactNumber: '9034820654' },
    { courseName: 'GenAI Summer Camp', studentName: 'Aparna', contactNumber: '7499498733' },
    { courseName: 'GenAI Summer Camp', studentName: 'Sanoy', contactNumber: '8942093262' },
    { courseName: 'GenAI Summer Camp', studentName: 'Divyam', contactNumber: '6386177561' },
    { courseName: 'GenAI Summer Camp', studentName: 'Aarav', contactNumber: '9628259211' },
    { courseName: 'GenAI Summer Camp', studentName: 'Saiprasad Sandip Deosarkar', contactNumber: '8010965530' },
    { courseName: 'GenAI Summer Camp', studentName: 'Zainab Fatima', contactNumber: '7006689298' },
    { courseName: 'GenAI Summer Camp', studentName: 'Eishita Singh', contactNumber: '7764076860' },
    { courseName: 'GenAI Summer Camp', studentName: 'Yashvardhan Singh', contactNumber: '7017208252' },
    { courseName: 'GenAI Summer Camp', studentName: 'Arshnoor Kaur', contactNumber: '9863163435' },
    { courseName: 'GenAI Summer Camp', studentName: 'Ayush', contactNumber: '9034320566' },
    { courseName: 'GenAI Summer Camp', studentName: 'Pushkaul Sengupta', contactNumber: '8697035672' },
    { courseName: 'GenAI Summer Camp', studentName: 'Saket', contactNumber: '9896173120' },
    { courseName: 'GenAI Summer Camp', studentName: 'Aadi', contactNumber: '8533813474' },
    { courseName: 'GenAI Summer Camp', studentName: 'Mayank Raj', contactNumber: '9322958217' },
  ]

  // Digital Marketing Summer Camp data (Jul 25)
  const digitalMarketingData = [
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Krishnav Bisht', contactNumber: '9811435408' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Crystal Boy Karan', contactNumber: '9905748246' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Vedant Sanap', contactNumber: '8788403754' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Aradhya', contactNumber: '7765830617' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Harshita', contactNumber: '8160801894' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Ananya Singh', contactNumber: '6201533205' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Gayatri Bandawar', contactNumber: '8626012736' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Meenal Sharma Sharma', contactNumber: '9067598945' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Mehnaza Tasdeeq', contactNumber: '6005956464' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Soumya Pati', contactNumber: '9732404862' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Hrehaan', contactNumber: '7758022127' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Shaanvi', contactNumber: '7236833882' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Atul Chauhan', contactNumber: '9354051067' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Ankit Prakash', contactNumber: '8210913408' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Shrija Bhujbal', contactNumber: '9527122644' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Sayantan Koley', contactNumber: '7365053953' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Anushka Singh', contactNumber: '9219052967' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Basharat', contactNumber: '9044464242' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Aditya Singh', contactNumber: '7903970060' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Kaustubh Tiwari', contactNumber: '9628879672' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Galaxy', contactNumber: '9335484604' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Prachi', contactNumber: '8709110279' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Pratibha', contactNumber: '7318036490' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Saransh', contactNumber: '9815017935' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Harjot Singh', contactNumber: '6280077440' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Ayush', contactNumber: '6394607672' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Om Prakash Chaudhary', contactNumber: '9918937364' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Aaqeeb Giram', contactNumber: '8446017261' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Himank Gupta', contactNumber: '7827985848' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Manasa', contactNumber: '9380719546' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Nimiesh Sharma', contactNumber: '7065316999' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Vedahi Nahar', contactNumber: '9617371401' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Avantika', contactNumber: '7903398344' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Syed Daiyaan Geelani', contactNumber: '8082311163' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Aanyaa', contactNumber: '9573822006' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Aryan', contactNumber: '8830932632' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Shivam Bharti', contactNumber: '8447795481' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Anant Kumar Singh', contactNumber: '7007412133' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Anshu Patel', contactNumber: '8839738151' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Shravan Patel', contactNumber: '9713877066' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Himanshu Yadav', contactNumber: '9250225561' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Hardik Jain', contactNumber: '9772994577' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Naitik', contactNumber: '9936721872' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Navinya Shahade', contactNumber: '7038403649' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Anshy Rathore', contactNumber: '9721536707' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Khanushiya Sofia Suhel Bhai', contactNumber: '6351102098' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Priyom Dutta', contactNumber: '9859804590' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Piyush Saha', contactNumber: '7407695767' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Pradnya Patil', contactNumber: '7821069210' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Divyanshi Baghel', contactNumber: '9201141410' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Shivam Patel', contactNumber: '6261204378' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Mahima', contactNumber: '8791882887' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Shaily Rajawat', contactNumber: '9887488800' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Suru Ahuja', contactNumber: '9302616430' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Shastri Chaturvedi', contactNumber: '6306251438' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Umang Srivastava', contactNumber: '9883058874' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Vinit Kumar', contactNumber: '9672968934' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Ayush Chaurasia', contactNumber: '7880945833' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Aaradhya Jindal', contactNumber: '8851440353' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Shiv', contactNumber: '9876340073' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Siddhi Panchal', contactNumber: '9929029078' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Vaishnavi', contactNumber: '7042600620' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Naitik Nirvan', contactNumber: '8709154938' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Ayaan MEHDI', contactNumber: '7007016247' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Muhammad Noman', contactNumber: '9324822906' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Raghav', contactNumber: '7906858396' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Ankit', contactNumber: '9729972892' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Kapilkumar', contactNumber: '7227019041' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Muneeb Ahmad Bhat', contactNumber: '6006566169' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Mohammad Anas', contactNumber: '9241174291' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Anik Dutta', contactNumber: '9609673017' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Zareen Khan', contactNumber: '7509694444' },
    { courseName: 'Digital Marketing Summer Camp', studentName: 'Parth', contactNumber: '9455494756' },
  ]

  // Combine all data
  const allData = [...healthcareData, ...genAIData, ...digitalMarketingData]

  console.log(`Seeding ${allData.length} records...`)

  // Insert all records using createMany
  try {
    const result = await prisma.summerCampBatch.createMany({
      data: allData,
      skipDuplicates: true, // This will skip records with duplicate contact numbers
    })

    console.log(`Successfully seeded ${result.count} records`)
  } catch (error) {
    console.error('Error seeding data:', error)
    
    // If bulk insert fails due to duplicates, try individual inserts
    console.log('Attempting individual record insertion...')
    let successCount = 0
    let errorCount = 0

    for (const record of allData) {
      try {
        await prisma.summerCampBatch.create({
          data: record
        })
        successCount++
      } catch (err) {
        errorCount++
        console.log(`Failed to insert ${record.studentName} with contact ${record.contactNumber}`)
      }
    }

    console.log(`Individual insertion complete: ${successCount} successful, ${errorCount} failed`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Database connection closed')
  })
  .catch(async (e) => {
    console.error('Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
