#! /bin/bash

cd ./ck
mvn clean compile package
cd ../
sudo apt-get install jq
sudo apt-get install jo

list=test.csv
data=()

while IFS="," read -r col1 col2
    do 
       echo "Displaying Record"
       echo ""
       echo "name: $col1"
       echo "url: $col2"
       echo ""
        localFolder="./$col1"
        if [ -d $localFolder ];
        then
             echo "Directory exist"
             rm -rf $localFolder
        else
            echo "Directory does not exist"
            git clone "$col2" "$localFolder"

            cd ./ck/target
            path=~/Documentos/pessoal/lab6
            java -jar ck-0.7.1-SNAPSHOT-jar-with-dependencies.jar $path true 0 False

            class=class.csv
            method=method.csv

            arr_cbo=( $(tail -n +2 $class | cut -d ',' -f4) )
            tLen_cbo=${#arr_cbo[@]}
            total_cbo=0

            for (( i=0; i<${tLen_cbo}; i++ ));
                do
                   num_cbo="${arr_cbo[$i]}"
                   total_cbo=`expr $total_cbo + $num_cbo`
                done

            echo "total_cbo: $total_cbo"

            arr_dit=( $(tail -n +2 $class | cut -d ',' -f9) )
            tLen_dit=${#arr_dit[@]}
            higher_number_dit=0

            for (( i=0; i<${tLen_dit}; i++ ))
                do
                    if [ $i -gt $higher_number_dit ];
                        then
                            higher_number_dit=$i
                        fi
                done

            echo "higher_number_dit: $higher_number_dit"

            re='^[+_]?[0-9]+([.][0-9]+)?$'
            arr_lcom_as=( $(tail -n +2 $class | cut -d ',' -f13) )
            tLen_lcom_as=${#arr_lcom_as[@]}
            total_lcom_as=0

            # for (( i=0; i<${tLen_lcom_as}; i++ ))
            #     do
            #         num_lcom_as=${arr_lcom_as[$i]}
            #         format_lcom_as=`echo $num_lcom_as | bc`
            #         if [ "$format_lcom_as" != "NaN" ]
            #             then
            #                 total_lcom_as=`echo $total_lcom_as + $format_lcom_as | bc`
            #             fi
            #     done

            echo "total_lcom_as: $total_lcom_as"
        
            arr_loc=( $(tail -n +2 $method | cut -d ',' -f12) )
            tLen_loc=${#arr_loc[@]}
            total_loc=0

            for (( i=0; i<${tLen_loc}; i++ ))
                do
                    num_loc=${arr_loc[$i]}

                    if [[ $num_loc =~ $re ]]
                        then
                            total_loc=`expr $total_loc + $num_loc`
                        fi
                    done

            echo "total_loc: $total_loc"

            resp=$(jo -p name=$col1 url=$col2 cbo=$total_cbo dit=$higher_number_dit lcom_as=$total_lcom_as loc=$total_loc)

            data+=($resp)

            cd ../../
            rm -rf $localFolder
        fi
    done  < <(cut -d "," -f1,2 $list | tail -n +2)

echo ${data[*]}

tLen_data=${#data[@]}
echo "name, url, cbo, dit, lcom_as, loc" > Arquivo.csv; \ 

 for (( i=0; i<${tLen_data}; i++ ))
    do
        line=${data[$i]}
        name=$(echo $line | jq .name)
        url=$(echo $line | jq .url)
        cbo=$(echo $line | jq .cbo)
        dit=$(echo $line | jq .dit)
        lcom_as=$(echo $line | jq .lcom_as)
        loc=$(echo $line | jq .loc)

        echo "$name, $url, $cbo, $dit, $lcom_as, $loc" >> Arquivo.csv
    done
